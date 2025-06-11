import { supabase } from "@/lib/supabase";
import * as ImageManipulator from "expo-image-manipulator";
import * as VideoThumbnails from "expo-video-thumbnails";

// Get all chat rooms for the current user
export const getUserChats = async (userId) => {
  try {
    // First get all room IDs where the user is a participant
    const { data: participantRooms, error: participantError } = await supabase
      .from("chat_participants")
      .select("room_id")
      .eq("user_id", userId);

    if (participantError) {
      console.error("Error fetching participant rooms:", participantError);
      throw participantError;
    }

    if (!participantRooms || participantRooms.length === 0) {
      return { success: true, data: [] };
    }

    const roomIds = participantRooms.map((p) => p.room_id);

    // Then get the full chat room data for those rooms
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
        last_message:chat_messages!room_id (
          content,
          type,
          created_at,
          sender:sender_id (
            id,
            username,
            first_name,
            last_name,
            image_url
          )
        )
      `
      )
      .in("id", roomIds)
      .order("updated_at", { ascending: false });

    // For each room, only keep the latest message in last_message
    let roomsWithUnread = [];
    if (data) {
      roomsWithUnread = await Promise.all(
        data.map(async (room) => {
          if (room.last_message && Array.isArray(room.last_message)) {
            room.last_message = room.last_message
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 1);
          }
          // Fetch unread count for this room
          const { success, data: unreadCount } = await getUnreadCount(
            room.id,
            userId
          );
          room.unread = success ? unreadCount : 0;

          return room;
        })
      );
    }

    if (error) throw error;
    return { success: true, data: roomsWithUnread };
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return { success: false, error: error.message };
  }
};

// Get a single chat room by ID
export const getChatById = async (roomId, userId) => {
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
        messages:chat_messages (
          id,
          content,
          type,
          metadata,
          created_at,
          sender:sender_id (
            id,
            username,
            first_name,
            last_name,
            image_url
          )
        )
      `
      )
      .eq("id", roomId)
      .single();

    if (error) throw error;
    // Fetch unread count for this room
    let unread = 0;
    if (userId) {
      const { success, data: unreadCount } = await getUnreadCount(
        roomId,
        userId
      );
      unread = success ? unreadCount : 0;
    }
    return { success: true, data: { ...data, unread } };
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error("Failed to get authenticated user");
    }

    // Verify that the passed userId matches the authenticated user
    if (userId !== user.id) {
      throw new Error(
        "User ID mismatch: passed ID does not match authenticated user"
      );
    }

    // First, try to get the current user's session to verify auth state
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Failed to get session");
    }

    // 1. Find all non-group chat rooms where the current user is a participant
    const { data: myRooms, error: myRoomsError } = await supabase
      .from("chat_participants")
      .select("room_id")
      .eq("user_id", userId);

    if (myRoomsError) {
      console.error("Error fetching user's rooms:", myRoomsError);
      throw myRoomsError;
    }

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

      if (roomError) {
        console.error("Error fetching direct rooms:", roomError);
        throw roomError;
      }

      for (const room of directRooms) {
        // Check if the other user is a participant
        const { data: otherParticipant, error: participantError } =
          await supabase
            .from("chat_participants")
            .select("id")
            .eq("room_id", room.id)
            .eq("user_id", otherUserId)
            .single();

        if (participantError && participantError.code !== "PGRST116") {
          console.error("Error checking other participant:", participantError);
          throw participantError;
        }

        if (otherParticipant) {
          // Found existing direct chat
          return { success: true, data: room };
        }
      }
    }

    // Create new chat room
    const insertData = {
      is_group: false,
      created_by: userId,
      updated_at: new Date().toISOString(),
    };

    //TODO: remove debugging code before exams
    // First, verify we can read from the table
    const { data: testRead, error: testReadError } = await supabase
      .from("chat_rooms")
      .select("id")
      .limit(1);

    // Then try the insert
    const { data, error: insertError } = await supabase
      .from("chat_rooms")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error("Detailed insert error:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
      throw insertError;
    }

    // Add participants
    const participantsData = [
      { room_id: data.id, user_id: userId, role: "admin" },
      { room_id: data.id, user_id: otherUserId, role: "member" },
    ];

    const { error: participantsError } = await supabase
      .from("chat_participants")
      .insert(participantsData);

    if (participantsError) {
      console.error("Error adding participants:", participantsError);
      throw participantsError;
    }

    // Fetch participants in a separate query if needed
    const { data: participants, error: fetchParticipantsError } = await supabase
      .from("chat_participants")
      .select("user_id, role")
      .eq("room_id", data.id);

    if (fetchParticipantsError) {
      console.error("Error fetching participants:", fetchParticipantsError);
      throw fetchParticipantsError;
    }

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

    // Deduplicate participantIds and exclude userId
    const uniqueParticipantIds = [...new Set(participantIds)].filter(
      (id) => id !== userId
    );
    const participants = [
      { room_id: room.id, user_id: userId, role: "admin" },
      ...uniqueParticipantIds.map((id) => ({
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
    // First get the room to check if it's a group
    const { data: room, error: roomError } = await supabase
      .from("chat_rooms")
      .select("is_group")
      .eq("id", roomId)
      .single();

    if (roomError) throw roomError;

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

    // Add is_group flag to each message
    const messagesWithGroupFlag = data.map((msg) => ({
      ...msg,
      is_group: room.is_group,
    }));

    return { success: true, data: messagesWithGroupFlag };
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
    // Get the authenticated user's ID
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error("Failed to get authenticated user");
    }

    // Verify that the passed userId matches the authenticated user
    if (userId !== user.id) {
      throw new Error(
        "User ID mismatch: passed ID does not match authenticated user"
      );
    }

    // Start a transaction
    const { data: messageData, error: messageError } = await supabase.rpc(
      "send_chat_message",
      {
        p_room_id: roomId,
        p_sender_id: userId,
        p_content: content,
        p_type: type,
        p_metadata: metadata,
        p_reply_to: replyTo,
      }
    );

    if (messageError) {
      console.error("Error sending message:", messageError);
      throw messageError;
    }

    return { success: true, data: messageData };
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

// Get unread count for a chat room
export const getUnreadCount = async (roomId, userId) => {
  try {
    const { data, error } = await supabase.rpc("get_unread_count", {
      room_id: roomId,
      user_id: userId,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return { success: false, error: error.message };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (roomId, userId) => {
  try {
    const { error } = await supabase.rpc("mark_messages_as_read", {
      room_id: roomId,
      user_id: userId,
    });
    if (error) throw error;
    // After marking as read, unread should be 0
    return { success: true, unread: 0 };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: error.message };
  }
};

// Update typing status
export const updateTypingStatus = async (roomId, userId, isTyping) => {
  try {
    const { error } = await supabase.from("typing_status").upsert(
      {
        room_id: roomId,
        user_id: userId,
        is_typing: isTyping,
        last_typed_at: new Date().toISOString(),
      },
      { onConflict: ["room_id", "user_id"] }
    );

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating typing status:", error);
    return { success: false, error: error.message };
  }
};

// Get typing users
export const getTypingUsers = async (roomId) => {
  try {
    const { data, error } = await supabase.rpc("get_typing_users", {
      room_id: roomId,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error getting typing users:", error);
    return { success: false, error: error.message };
  }
};

// Upload file to storage
export const uploadFile = async (file, type, roomId, userId) => {
  try {
    const fileExt = file.uri.split(".").pop();
    const fileName = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}.${fileExt}`;
    const filePath = `${roomId}/${userId}/${type}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(filePath, {
        uri: file.uri,
        type: file.type,
        name: fileName,
      });

    if (uploadError) throw uploadError;

    // Only return the file path (not the public URL)
    return { success: true, data: { path: filePath } };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: error.message };
  }
};

// Get a signed URL for a file path (for private buckets)
export const getSignedUrl = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from("chat-attachments")
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) {
      throw error;
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send attachment message
export const sendAttachment = async (roomId, userId, file, type) => {
  try {
    // First upload the file
    const {
      success: uploadSuccess,
      data: uploadData,
      error: uploadError,
    } = await uploadFile(file, type, roomId, userId);
    if (!uploadSuccess) throw uploadError;

    // Prepare metadata
    let metadata = {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      duration: file.duration, // for audio/video
      thumbnail: file.thumbnail, // for video
    };

    // Add width/height for images
    if (type === "image" && file.uri) {
      try {
        const { width, height } = await ImageManipulator.manipulateAsync(
          file.uri,
          [],
          { base64: false }
        );
        if (width && height) {
          metadata.width = width;
          metadata.height = height;
        }
      } catch (e) {
        // Ignore if we can't get dimensions
      }
    }
    // Add width/height for videos
    if (type === "video" && file.uri) {
      try {
        const { width, height } = await VideoThumbnails.getThumbnailAsync(
          file.uri
        );
        if (width && height) {
          metadata.width = width;
          metadata.height = height;
        }
      } catch (e) {
        // Ignore if we can't get dimensions
      }
    }

    // Then send the message with the file path (not URL)
    const { success, error } = await sendMessage(
      roomId,
      userId,
      uploadData.path, // store the file path
      type,
      metadata
    );

    if (!success) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error sending attachment:", error);
    return { success: false, error: error.message };
  }
};

// Send a checklist message
export const sendChecklist = async (roomId, userId, title, items) => {
  // 1. Create the chat message of type 'checklist'
  const {
    success: msgSuccess,
    data: msgData,
    error: msgError,
  } = await sendMessage(
    roomId,
    userId,
    null, // content is null, checklist data is in related tables
    "checklist"
  );
  if (!msgSuccess) throw msgError;

  // 2. Create the checklist
  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .insert({
      message_id: msgData.id,
      title,
    })
    .select()
    .single();
  if (checklistError) throw checklistError;

  // 3. Create checklist items
  const itemsToInsert = items.map((content, idx) => ({
    checklist_id: checklist.id,
    content,
    position: idx,
  }));
  const { error: itemsError } = await supabase
    .from("checklist_items")
    .insert(itemsToInsert);
  if (itemsError) throw itemsError;

  return { success: true };
};

// Get checklist, items, and checked state for a message (shared checklist)
export const getChecklistForMessage = async (messageId) => {
  // 1. Get checklist
  const { data: checklist, error: checklistError } = await supabase
    .from("checklists")
    .select("id, title")
    .eq("message_id", messageId)
    .single();
  if (checklistError) throw checklistError;

  // 2. Get items (with checked and checked_by)
  const { data: items, error: itemsError } = await supabase
    .from("checklist_items")
    .select("id, content, position, checked, checked_by")
    .eq("checklist_id", checklist.id)
    .order("position");
  if (itemsError) throw itemsError;

  return {
    checklist,
    items,
  };
};

// Toggle a checklist item for all users (shared)
export const toggleChecklistItemShared = async (itemId, userId, checked) => {
  const update = {
    checked,
    checked_by: userId, // last user who checked/unchecked
  };
  const { error } = await supabase
    .from("checklist_items")
    .update(update)
    .eq("id", itemId);
  if (error) throw error;
  return { success: true };
};
