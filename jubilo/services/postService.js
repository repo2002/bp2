import { supabase } from "@/lib/supabase";
import { notifyComment, notifyLike } from "@/services/notificationService";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export const createOrUpdatePost = async (post) => {
  try {
    console.log("Creating post with data:", {
      content: post.content?.substring(0, 50) + "...",
      imageCount: post.image_urls?.length || 0,
      hasLocation: !!post.location,
      isPrivate: post.is_private,
      userId: post.user_id,
    });

    // Validate required fields
    if (!post.user_id) {
      throw new Error("User ID is required");
    }

    if (!post.content && (!post.image_urls || post.image_urls.length === 0)) {
      throw new Error("Post must have either content or images");
    }

    // 1. Create the post first (without images)
    const postData = {
      content: post.content || "",
      location: post.location || null,
      is_private: post.is_private || false,
      user_id: post.user_id,
      created_at: new Date().toISOString(),
      images: null, // will update after upload
    };

    console.log("Inserting post with data:", postData);

    const { data, error: postError } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (postError) {
      console.error("Error creating post in database:", {
        error: postError,
        code: postError.code,
        message: postError.message,
        details: postError.details,
        hint: postError.hint,
      });
      return { success: false, data: null, error: postError.message };
    }

    if (!data) {
      return {
        success: false,
        data: null,
        error: "No data returned from post creation",
      };
    }

    console.log("Post created successfully:", data.id);
    const postId = data.id;

    // 2. Upload images (if any)
    let relativePaths = [];
    if (post.image_urls && post.image_urls.length > 0) {
      for (const asset of post.image_urls) {
        try {
          let fileName = "image.jpg";
          let fileUri = null;
          if (typeof asset === "string" && asset.startsWith("ph://")) {
            const assetId = asset.replace("ph://", "");
            const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
            if (!assetInfo || !assetInfo.localUri) {
              console.error("No local URI found for asset:", assetId);
              continue;
            }
            fileName = assetInfo.filename || fileName;
            fileUri = assetInfo.localUri;
          } else if (typeof asset === "string" && asset.startsWith("file://")) {
            // Already a file URI
            fileName = asset.split("/").pop() || fileName;
            fileUri = asset;
          } else if (typeof asset === "string") {
            // Already a relative path (e.g. from Supabase)
            relativePaths.push(asset);
            continue;
          }

          if (!fileUri) continue;

          // Path: user_id/post_id/images/filename
          const relativePath = `${post.user_id}/${postId}/images/${fileName}`;

          // Read the file as base64
          const file = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Upload to Supabase storage
          const { error: uploadError } = await supabase.storage
            .from("post-media")
            .upload(relativePath, decode(file), {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue;
          }

          relativePaths.push(relativePath);
          console.log("Successfully uploaded image:", relativePath);
        } catch (error) {
          console.error("Error processing image:", error);
        }
      }
    }

    // 3. Update the post with the images array (relative paths)
    if (relativePaths.length > 0) {
      const { error: updateError } = await supabase
        .from("posts")
        .update({ images: relativePaths })
        .eq("id", postId);
      if (updateError) {
        console.error("Error updating post with images:", updateError);
        // Not throwing, just logging
      }
    }

    return {
      success: true,
      data: { ...data, images: relativePaths },
      error: null,
    };
  } catch (error) {
    console.error("Error in createOrUpdatePost:", {
      message: error.message,
      stack: error.stack,
      post: {
        contentLength: post.content?.length,
        imageCount: post.image_urls?.length,
        hasLocation: !!post.location,
        userId: post.user_id,
      },
    });
    return {
      success: false,
      data: null,
      error: error.message || "Unknown error occurred",
      details: error,
    };
  }
};

export async function fetchPosts({ limit = 10, offset = 0 } = {}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get all posts with user info and post-level privacy
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          id,
          username,
          image_url,
          is_private
        ),
        comments (
          id,
          content,
          created_at,
          user:user_id (
            id,
            username,
            image_url
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // For each post, check if we should show it based on post privacy
    const visiblePosts = await Promise.all(
      posts.map(async (post) => {
        // Always show user's own posts
        if (post.user_id === user.id) {
          return post;
        }
        // If the post is public, show it
        if (!post.is_private) {
          return post;
        }
        // If the post is private, check follow status
        const { data: followStatus } = await supabase
          .from("followers")
          .select("status")
          .match({
            follower_id: user.id,
            following_id: post.user.id,
          })
          .single();
        // Only show the post if the current user is following the author
        if (followStatus?.status === "accepted") {
          return post;
        }
        // Hide the post for non-followers or pending requests
        return null;
      })
    );

    // Filter out null posts (hidden posts)
    return {
      data: visiblePosts.filter(Boolean),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { data: null, error };
  }
}

export async function fetchPostsByUser(
  userId,
  { limit = 20, offset = 0 } = {}
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Always show user's own posts
    if (userId === user.id) {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:user_id (
            id,
            username,
            image_url
          ),
          comments (
            id,
            content,
            created_at,
            user:user_id (
              id,
              username,
              image_url
            )
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { data, error: null };
    }

    // For other users, fetch their posts
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        user:user_id (
          id,
          username,
          image_url
        ),
        comments (
          id,
          content,
          created_at,
          user:user_id (
            id,
            username,
            image_url
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // For each post, check if we should show it based on post privacy
    const visiblePosts = await Promise.all(
      posts.map(async (post) => {
        // If the post is public, show it
        if (!post.is_private) {
          return post;
        }
        // If the post is private, check follow status
        const { data: followStatus } = await supabase
          .from("followers")
          .select("status")
          .match({
            follower_id: user.id,
            following_id: userId,
          })
          .single();
        // Only show the post if the current user is following the author
        if (followStatus?.status === "accepted") {
          return post;
        }
        // Hide the post for non-followers or pending requests
        return null;
      })
    );

    // Filter out null posts (hidden posts)
    return {
      data: visiblePosts.filter(Boolean),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return { data: null, error };
  }
}

// Like a post
export const likePost = async (postId, userId) => {
  try {
    console.log("Liking post:", { postId });

    // First check if the like already exists
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select()
      .match({ post_id: postId, user_id: userId })
      .single();

    if (existingLike) {
      console.log("Like already exists, unliking...");
      return unlikePost(postId, userId);
    }

    // If not liked, create new like
    const { data, error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId })
      .select();

    if (error) throw error;

    // Get the post to find the owner
    const { data: post } = await fetchPostById(postId);

    if (post && post.user_id !== userId) {
      const { data: notification, error: notificationError } = await notifyLike(
        postId,
        post.user_id,
        userId
      );

      if (notificationError) {
        console.error("Failed to create like notification:", notificationError);
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in likePost:", error);
    return { data: null, error };
  }
};

// Unlike a post
export async function unlikePost(postId, userId) {
  const { data, error } = await supabase
    .from("post_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  return { data, error };
}

// Get like count and if user liked
export async function getPostLikes(postId, userId) {
  const { data: likes, error } = await supabase
    .from("post_likes")
    .select("user_id")
    .eq("post_id", postId);

  const likeCount = likes?.length || 0;
  const likedByUser = !!likes?.find((like) => like.user_id === userId);
  return { data: { likeCount, likedByUser }, error };
}

// Add a comment
export async function addComment(postId, postOwnerId, userId, content) {
  try {
    // Insert the comment with the sender as the userId
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: userId, content }) // user_id here is the commenter
      .select();

    if (error) throw error;

    // Notify the post owner (recipient) if not self
    if (postOwnerId !== userId) {
      const { data: notification, error: notificationError } =
        await notifyComment(postId, postOwnerId, userId);

      if (notificationError) {
        console.error(
          "Failed to create comment notification:",
          notificationError
        );
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in addComment:", error);
    return { data: null, error };
  }
}

// Get all comments for a post
export async function getComments(postId, { limit = 50, order = "desc" } = {}) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, user:user_id (id, username, image_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: order === "asc" })
    .limit(limit);
  return { data, error };
}

// Get the last comment for a post
export async function getLastComment(postId) {
  const { data, error } = await supabase
    .from("comments")
    .select("*, user:user_id (username, image_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return { data, error };
}

export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${filePath}`;
  }
  return null;
};

export async function deleteComment(commentId) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);
  return { error };
}

export async function fetchPostById(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      user:user_id (
        id,
        username,
        image_url
      ),
      comments (
        id,
        content,
        created_at,
        user:user_id (
          id,
          username,
          image_url
        )
      )
    `
    )
    .eq("id", postId)
    .single();
  return { data, error };
}

export const getUserPostCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw error;
    return { data: count || 0, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
