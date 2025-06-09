import { supabase } from "@/lib/supabase";
import { notifyFollowRequest } from "@/services/notificationService";

export const followUser = async (userId) => {
  try {
    console.log("Starting followUser:", { userId });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get the target user's privacy setting
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("is_private")
      .eq("id", userId)
      .single();

    // Set status based on privacy
    const status = targetProfile?.is_private ? "pending" : "accepted";

    // First check if there's an existing relationship
    const { data: existing, error: checkError } = await supabase
      .from("followers")
      .select("status")
      .match({
        follower_id: user.id,
        following_id: userId,
      })
      .single();

    if (checkError && checkError.code !== "PGRST116") throw checkError;

    // If there's an existing relationship, return it
    if (existing) {
      return {
        data: existing,
        error: null,
      };
    }

    // If no existing relationship, create a new one
    const { data, error } = await supabase
      .from("followers")
      .insert([
        {
          follower_id: user.id,
          following_id: userId,
          status,
        },
      ])
      .select();

    if (error) throw error;

    // Create notification for the user being followed
    if (status === "pending") {
      await notifyFollowRequest(userId, user.id);
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in followUser:", error);
    return { data: null, error };
  }
};

export const unfollowUser = async (userId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.from("followers").delete().match({
      follower_id: user.id,
      following_id: userId,
    });

    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const requestFollow = async (userId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // First check if there's an existing relationship
    const { data: existing, error: checkError } = await supabase
      .from("followers")
      .select("status")
      .match({
        follower_id: user.id,
        following_id: userId,
      })
      .single();

    if (checkError && checkError.code !== "PGRST116") throw checkError;

    // If there's an existing relationship, return it
    if (existing) {
      return {
        data: existing,
        error: null,
      };
    }

    // If no existing relationship, create a new one
    const { data, error } = await supabase
      .from("followers")
      .insert([
        {
          follower_id: user.id,
          following_id: userId,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;

    // Create notification for the user being followed
    await notifyFollowRequest(userId, user.id);

    return { data, error: null };
  } catch (error) {
    console.error("Error in requestFollow:", error);
    return { data: null, error };
  }
};

export const cancelFollowRequest = async (userId) => {
  // Since we're using a single table, this is the same as unfollowUser
  return unfollowUser(userId);
};

export const acceptFollowRequest = async (requestId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("followers")
      .update({ status: "accepted" })
      .match({
        id: requestId,
        following_id: user.id, // Ensure the current user is the one being followed
      })
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const denyFollowRequest = async (requestId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("followers")
      .update({ status: "denied" })
      .match({
        id: requestId,
        following_id: user.id, // Ensure the current user is the one being followed
      })
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getFollowStatus = async (userId) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("followers")
      .select("status")
      .match({
        follower_id: user.id,
        following_id: userId,
      })
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (data) {
      return {
        data: {
          status:
            data.status === "accepted"
              ? "following"
              : data.status === "pending"
              ? "requested"
              : "none",
        },
        error: null,
      };
    }

    return { data: { status: "none" }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getFollowers = async (userId, page = 1, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from("followers")
      .select("*")
      .match({
        following_id: userId,
        status: "accepted",
      })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getFollowing = async (userId, page = 1, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from("followers")
      .select("*")
      .match({
        follower_id: userId,
        status: "accepted",
      })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getPendingFollowRequests = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("followers")
      .select(
        `
        id,
        follower:profiles!followers_follower_id_fkey (
          id,
          username,
          first_name,
          last_name,
          image_url
        ),
        created_at
      `
      )
      .eq("following_id", user.id)
      .eq("status", "pending");

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error getting pending follow requests:", error);
    return { data: null, error };
  }
};
