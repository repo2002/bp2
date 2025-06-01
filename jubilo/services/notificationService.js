import { supabase } from "@/lib/supabase";

// Fetch notifications for a user
export async function fetchNotifications(userId) {
  try {
    console.log("Fetching notifications for user:", userId);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { data: null, error };
  }
}

// Mark a notification as read
export async function markNotificationRead(notificationId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { data: null, error };
  }
}

// Create a notification
export async function createNotification({
  user_id,
  sender_id,
  category,
  reference_type,
  reference_id,
}) {
  try {
    const { data, error } = await supabase.from("notifications").insert({
      user_id,
      sender_id,
      category,
      reference_type,
      reference_id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { data: null, error };
  }
}

// Insert a notification for a like
export async function notifyLike(postId, userId, likedByUserId) {
  try {
    console.log("Creating like notification:", {
      postId,
      userId,
      likedByUserId,
    });
    const { data, error } = await createNotification({
      user_id: userId,
      sender_id: likedByUserId,
      category: "like",
      reference_type: "post",
      reference_id: postId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating like notification:", error);
    return { data: null, error };
  }
}

// Insert a notification for a comment
export async function notifyComment(postId, userId, senderId) {
  try {
    // userId = recipient, senderId = actor
    const { data: authUser } = await supabase.auth.getUser();
    console.log(
      "notifyComment: user_id (recipient):",
      userId,
      "sender_id (actor):",
      senderId,
      "auth.uid():",
      authUser?.user?.id
    );

    if (userId === senderId) {
      console.log(
        "Skipping notification: sender and recipient are the same user"
      );
      return { data: null, error: null };
    }

    const { data, error } = await createNotification({
      user_id: userId,
      sender_id: senderId,
      category: "comment",
      reference_type: "post",
      reference_id: postId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating comment notification:", error);
    return { data: null, error };
  }
}

// Insert a notification for a follow request
export async function notifyFollowRequest(userId, requestedByUserId) {
  try {
    console.log("Creating follow request notification:", {
      userId,
      requestedByUserId,
    });

    const { data, error } = await createNotification({
      user_id: userId,
      sender_id: requestedByUserId,
      category: "follow_request",
      reference_type: "profile",
      reference_id: userId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating follow request notification:", error);
    return { data: null, error };
  }
}
