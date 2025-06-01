import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";

// Subscribe to posts, likes, and comments
export function subscribeToPosts({ onInsert, onDelete, onLike, onComment }) {
  const postsSubscription = supabase
    .channel("posts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "posts" },
      async (payload) => {
        if (onInsert) {
          const newPost = payload.new;
          // Optionally fetch user data, etc.
          const { data: userData } = await getUserData(newPost.user_id);
          newPost.user = userData;
          onInsert(newPost);
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "posts" },
      (payload) => {
        if (onDelete) onDelete(payload.old.id);
      }
    )
    .subscribe();

  // Add likes and comments subscriptions similarly...

  return () => {
    postsSubscription.unsubscribe();
    // Unsubscribe from other channels as well
  };
}

export function subscribeToLikes({ onInsert, onDelete }) {
  const likesSubscription = supabase
    .channel("post_likes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "post_likes" },
      (payload) => {
        if (onInsert) onInsert(payload.new);
        if (onDelete) onDelete(payload.old.id);
      }
    )
    .subscribe();
  return () => {
    likesSubscription.unsubscribe();
  };
}

export function subscribeToComments({ onInsert, onDelete }) {
  const commentsSubscription = supabase
    .channel("comments")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments" },
      (payload) => {
        if (onInsert) onInsert(payload.new);
        if (onDelete) onDelete(payload.old.id);
      }
    )
    .subscribe();
  return () => {
    commentsSubscription.unsubscribe();
  };
}
