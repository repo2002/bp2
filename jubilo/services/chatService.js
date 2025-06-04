import { supabase } from "@/lib/supabase";

// Get all chat rooms for the current user
export const getUserChats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("chat_rooms")
      .select(
        `
        *,
        participants:chat_participants (
          user:user_id (
            id,
            username,
            first_name,
            last_name,
            image_url
          ),
          role
        ),
        last_message:chat_messages (
          content,
          type,
          created_at,
          sender:sender_id (
            id,
            username,
            first_name,
            last_name
          )
        )
      `
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return { success: false, error: error.message };
  }
};

// Get a single chat room by ID
export const getChatById = async (roomId) => {
  try {
    const { data, error } = await supabase
      .from("chat_rooms")
      .select(
        `
        *,
        participants:chat_participants (
          user:user_id (
            id,
            username,
            first_name,
            last_name,
            image_url
          ),
          role
        )
      `
      )
      .eq("id", roomId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching chat:", error);
    return { success: false, error: error.message };
  }
};

// Create a new direct chat
export const createDirectChat = async (userId, otherUserId) => {
  try {
    // Get the authenticated user's ID
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log("Current user:", user, "Error:", error);

    // 1. Find all non-group chat rooms where the current user is a participant
    const { data: myRooms, error: myRoomsError } = await supabase
      .from("chat_participants")
      .select("room_id")
      .eq("user_id", userId);

    if (myRoomsError) throw myRoomsError;

    const roomIds = myRooms.map((p) => p.room_id);

    if (roomIds.length === 0) {
      // No rooms, so no direct chat exists
    } else {
      // 2. Find a non-group chat room where the other user is also a participant
      const { data: directRooms, error: roomError } = await supabase
        .from("chat_rooms")
        .select("id")
        .in("id", roomIds)
        .eq("is_group", false);

      if (roomError) throw roomError;

      for (const room of directRooms) {
        // Check if the other user is a participant
        const { data: otherParticipant } = await supabase
          .from("chat_participants")
          .select("id")
          .eq("room_id", room.id)
          .eq("user_id", otherUserId)
          .single();

        if (otherParticipant) {
          // Found existing direct chat
          return { success: true, data: room };
        }
      }
    }

    // Create new chat room
    const { data, error: insertError } = await supabase
      .from("chat_rooms")
      .insert({
        is_group: false,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    console.log("Insert result:", data, "Insert error:", insertError);

    if (insertError) throw insertError;

    // Add participants
    const { error: participantsError } = await supabase
      .from("chat_participants")
      .insert([
        { room_id: data.id, user_id: userId, role: "admin" },
        { room_id: data.id, user_id: otherUserId, role: "member" },
      ]);

    if (participantsError) throw participantsError;

    // Fetch participants in a separate query if needed
    const { data: participants } = await supabase
      .from("chat_participants")
      .select("user_id, role")
      .eq("room_id", data.id);

    return { success: true, data: { ...data, participants } };
  } catch (error) {
    console.error("Error creating direct chat:", error);
    return { success: false, error: error.message };
  }
};

// Create a new group chat
export const createGroupChat = async (userId, name, participantIds) => {
  try {
    // Create new chat room
    const { data: room, error: roomError } = await supabase
      .from("chat_rooms")
      .insert({
        is_group: true,
        name,
        created_by: userId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add participants
    const participants = [
      { room_id: room.id, user_id: userId, role: "admin" },
      ...participantIds.map((id) => ({
        room_id: room.id,
        user_id: id,
        role: "member",
      })),
    ];

    const { error: participantsError } = await supabase
      .from("chat_participants")
      .insert(participants);

    if (participantsError) throw participantsError;

    // If you want to return the room with participants, fetch them:
    const { data: roomParticipants } = await supabase
      .from("chat_participants")
      .select("user_id, role")
      .eq("room_id", room.id);

    return { success: true, data: { ...room, participants: roomParticipants } };
  } catch (error) {
    console.error("Error creating group chat:", error);
    return { success: false, error: error.message };
  }
};

// Get messages for a chat room
export const getChatMessages = async (roomId, { limit = 50, before } = {}) => {
  try {
    let query = supabase
      .from("chat_messages")
      .select(
        `
        *,
        sender:sender_id (
          id,
          username,
          first_name,
            last_name,
          image_url
        ),
        reply:reply_to (
          id,
          content,
          type,
          sender:sender_id (
            id,
            username
          )
        )
      `
      )
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt("created_at", before);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return { success: false, error: error.message };
  }
};

// Send a message
export const sendMessage = async (
  roomId,
  userId,
  content,
  type = "text",
  metadata = null,
  replyTo = null
) => {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        sender_id: userId,
        content,
        type,
        metadata,
        reply_to: replyTo,
        created_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        sender:sender_id (
          id,
          username,
          first_name,
            last_name,
          image_url
        ),
        reply:reply_to (
          id,
          content,
          type,
          sender:sender_id (
            id,
            username
          )
        )
      `
      )
      .single();

    if (error) throw error;

    // Update room's updated_at
    await supabase
      .from("chat_rooms")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", roomId);

    return { success: true, data };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
};

// Add participant to a group chat
export const addParticipant = async (roomId, userId, newParticipantId) => {
  try {
    const { error } = await supabase.from("chat_participants").insert({
      room_id: roomId,
      user_id: newParticipantId,
      role: "member",
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error adding participant:", error);
    return { success: false, error: error.message };
  }
};

// Remove participant from a group chat
export const removeParticipant = async (roomId, userId) => {
  try {
    const { error } = await supabase
      .from("chat_participants")
      .delete()
      .match({ room_id: roomId, user_id: userId });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error removing participant:", error);
    return { success: false, error: error.message };
  }
};
