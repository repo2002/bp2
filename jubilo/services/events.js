import { sendMessage } from "@/services/chatService";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import { supabase } from "../lib/supabase";

export const getEvents = async ({
  page = 1,
  limit = 10,
  isPrivate = null,
  status = null,
  userId = null,
  category = null,
} = {}) => {
  try {
    // Get current user for debugging
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Debug query to check if there are any events at all
    const { data: allEvents, error: debugError } = await supabase
      .from("events")
      .select("*")
      .limit(1);

    let query = supabase
      .from("events")
      .select(
        `
        *,
        creator:profiles!creator_id(
          id,
          username,
          first_name,
          last_name,
          image_url
        ),
        participants:event_participants(
          id,
          status,
          user:profiles!user_id(
            id,
            username,
            first_name,
          last_name,
            image_url
          )
        ),
        followers:event_followers(count),
        posts:event_posts(count),
        questions:event_questions(count),
        images:event_images(image_url)
      `
      )
      .order("start_time", { ascending: true });

    // Apply filters
    if (isPrivate !== null) {
      query = query.eq("is_private", isPrivate);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (category) {
      query = query.eq("category", category);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      events: data,
      total: count,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const getEventDetails = async (eventId, currentUserId = null) => {
  try {
    // Fetch all event details in one query
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        description,
        start_time,
        end_time,
        timezone,
        category,
        is_private,
        max_participants,
        location,
        creator_id,
        creator:profiles!creator_id(
          id,
          username,
          first_name,
          last_name,
          image_url
        ),
        participants:event_participants(
          id,
          status,
          user:profiles!user_id(
            id,
            username,
            image_url
          )
        ),
        images:event_images(
          id,
          image_url,
          is_primary,
          user:profiles!user_id(
            id,
            username,
            image_url
          )
        ),
        questions:event_questions(
          id,
          question,
          created_at,
          upvotes,
          user:profiles!user_id(
            id,
            username,
            image_url
          ),
          answers:event_answers(
            id,
            answer,
            created_at,
            upvotes,
            user:profiles!user_id(
              id,
              username,
              image_url
            )
          )
        ),
        invites:event_invitations(
          id,
          status,
          created_at,
          user:profiles!user_id(
            id,
            username,
            image_url
          )
        ),
        followers:event_followers(
          id,
          user:profiles!user_id(
            id,
            username,
            image_url
          )
        ),
        followers_count:event_followers(count)
      `
      )
      .eq("id", eventId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Event not found");

    // Permissions & status helpers
    const isOwner = currentUserId && data.creator_id === currentUserId;
    const isParticipant = !!data.participants?.find(
      (p) => p.user?.id === currentUserId
    );
    const isInvited = !!data.invites?.find(
      (i) => i.user?.id === currentUserId && i.status === "pending"
    );
    const isFollowing = !!data.followers?.find(
      (f) => f.user?.id === currentUserId
    );
    const canEdit = isOwner;
    const canInvite = isOwner && data.is_private;
    const canUploadImages =
      isOwner || (data.allow_user_images && isParticipant);
    const canAnswerQnA =
      isOwner || (data.is_private ? isParticipant : isFollowing);

    return {
      ...data,
      permissions: {
        isOwner,
        isParticipant,
        isInvited,
        isFollowing,
        canEdit,
        canInvite,
        canUploadImages,
        canAnswerQnA,
      },
    };
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    // Validate category
    const validCategories = [
      "party",
      "meeting",
      "sports",
      "music",
      "food",
      "festival",
      "wedding",
      "reunion",
      "other",
    ];
    if (!validCategories.includes(eventData.category)) {
      throw new Error("Invalid category");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) throw new Error("You must be logged in to create events.");
    const { data, error } = await supabase
      .from("events")
      .insert([{ ...eventData, creator_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    // Validate category if it's being updated
    if (eventData.category) {
      const validCategories = [
        "party",
        "meeting",
        "sports",
        "music",
        "food",
        "festival",
        "wedding",
        "reunion",
        "other",
      ];
      if (!validCategories.includes(eventData.category)) {
        throw new Error("Invalid category");
      }
    }

    const { data, error } = await supabase
      .from("events")
      .update(eventData)
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const updateRSVP = async (eventId, status) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be logged in to RSVP.");
  try {
    const { data, error } = await supabase
      .from("event_participants")
      .upsert({
        event_id: eventId,
        user_id: user.id,
        status,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating RSVP:", error);
    throw error;
  }
};

export const followEvent = async (eventId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be logged in to follow events.");
  try {
    // Check if already following
    const { data: existing, error: checkError } = await supabase
      .from("event_followers")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();
    if (checkError && checkError.code !== "PGRST116") throw checkError;
    if (existing) {
      return existing;
    }
    // Not following, insert
    const { data, error } = await supabase
      .from("event_followers")
      .insert({
        event_id: eventId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error following event:", error);
    throw error;
  }
};

export const unfollowEvent = async (eventId) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be logged in to unfollow events.");
  try {
    const { error } = await supabase
      .from("event_followers")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error unfollowing event:", error);
    throw error;
  }
};

export const inviteToEvent = async (eventId, userId, inviterId) => {
  try {
    const { data, error } = await supabase
      .from("event_invitations")
      .insert({
        event_id: eventId,
        user_id: userId,
        inviter_id: inviterId,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error inviting to event:", error);
    throw error;
  }
};

export const getEventInvites = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from("event_invitations")
      .select(
        `
        *,
        user:profiles!user_id(username)
      `
      )
      .eq("event_id", eventId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching event invites:", error);
    throw error;
  }
};

export const createEventQuestion = async (eventId, question) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be logged in to ask questions.");
  try {
    const { data, error } = await supabase
      .from("event_questions")
      .insert({
        event_id: eventId,
        user_id: user.id,
        question,
      })
      .select(
        `
        *,
        user:profiles!user_id(username)
      `
      )
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating event question:", error);
    throw error;
  }
};

export const answerEventQuestion = async (questionId, answer) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be logged in to answer questions.");
  try {
    const { data, error } = await supabase
      .from("event_answers")
      .insert({
        question_id: questionId,
        user_id: user.id,
        answer,
      })
      .select(
        `
        *,
        user:profiles!user_id(username)
      `
      )
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error answering event question:", error);
    throw error;
  }
};

export const createEventPost = async (eventId, content) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) throw new Error("You must be logged in to post.");
  try {
    const { data, error } = await supabase
      .from("event_posts")
      .insert({
        event_id: eventId,
        user_id: user.id,
        content,
      })
      .select(
        `
        *,
        user:profiles!user_id(username)
      `
      )
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating event post:", error);
    throw error;
  }
};

export const uploadEventImage = async (eventId, fileUri, isPrimary = false) => {
  try {
    // Read the file as base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const decodedImageData = decode(fileBase64);

    // Generate a unique filename
    const fileName = `${eventId}/${new Date().getTime()}.jpg`;
    const filePath = `event-images/${fileName}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("events")
      .upload(filePath, decodedImageData, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("events").getPublicUrl(filePath);

    // If this is primary, unset any existing primary images
    if (isPrimary) {
      await supabase
        .from("event_images")
        .update({ is_primary: false })
        .eq("event_id", eventId)
        .eq("is_primary", true);
    }

    // Create the image record
    const { data: imageRecord, error: dbError } = await supabase
      .from("event_images")
      .insert({
        event_id: eventId,
        image_url: publicUrl,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating image record:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true, data: imageRecord };
  } catch (error) {
    console.error("Error uploading event image:", error);
    return { success: false, error: error.message };
  }
};

export const deleteEventImage = async (imageId) => {
  try {
    // Get the image URL first
    const { data: image, error: fetchError } = await supabase
      .from("event_images")
      .select("image_url")
      .eq("id", imageId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const filePath = image.image_url.split("/").pop();
    const { error: deleteError } = await supabase.storage
      .from("events")
      .remove([`event-images/${filePath}`]);

    if (deleteError) throw deleteError;

    // Delete the record
    const { error } = await supabase
      .from("event_images")
      .delete()
      .eq("id", imageId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting event image:", error);
    throw error;
  }
};

export const setPrimaryImage = async (imageId) => {
  try {
    // Get the event_id first
    const { data: image, error: fetchError } = await supabase
      .from("event_images")
      .select("event_id")
      .eq("id", imageId)
      .single();

    if (fetchError) throw fetchError;

    // Unset any existing primary images
    await supabase
      .from("event_images")
      .update({ is_primary: false })
      .eq("event_id", image.event_id)
      .eq("is_primary", true);

    // Set the new primary image
    const { data, error } = await supabase
      .from("event_images")
      .update({ is_primary: true })
      .eq("id", imageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error setting primary image:", error);
    throw error;
  }
};

export const getEventImages = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from("event_images")
      .select("*")
      .eq("event_id", eventId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching event images:", error);
    throw error;
  }
};

export const getEventQuestions = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from("event_questions")
      .select(
        `
        *,
        user:profiles!user_id(username),
        answers:event_answers(
          *,
          user:profiles!user_id(username)
        )
      `
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching event questions:", error);
    throw error;
  }
};

export const getEventPosts = async (eventId, { page = 1, limit = 10 } = {}) => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("event_posts")
      .select(
        `
        *,
        user:profiles!user_id(username)
      `,
        { count: "exact" }
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      posts: data,
      total: count,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching event posts:", error);
    throw error;
  }
};

// Utility: get time boundaries
const now = new Date();
const startOfWeek = new Date(now);
startOfWeek.setHours(0, 0, 0, 0);
const endOfWeek = new Date(now);
endOfWeek.setDate(now.getDate() + 7);
endOfWeek.setHours(23, 59, 59, 999);

// 1. Past Events: end_time < now
export function filterPastEvents(events) {
  return events.filter((e) => new Date(e.end_time) < now);
}

// 2. Upcoming Events: start_time within next 7 days
export function filterUpcomingEvents(events) {
  return events.filter((e) => {
    const start = new Date(e.start_time);
    return start >= now && start <= endOfWeek;
  });
}

// 3. Near You: events within X km of userLocation
export function filterNearYouEvents(events, userLocation, maxDistanceKm = 25) {
  if (!userLocation) return [];
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  return events.filter((e) => {
    const loc = e.location;
    if (!loc || !loc.lat || !loc.lng) return false;
    return (
      getDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng) <=
      maxDistanceKm
    );
  });
}

// 4. Featured Events: public, not past, most followers
export function filterFeaturedEvents(events, count = 5) {
  return events
    .filter((e) => !e.is_private && new Date(e.end_time) > now)
    .sort((a, b) => (b.followers?.count || 0) - (a.followers?.count || 0))
    .slice(0, count);
}

// 5. Recommended: events your friends are participating in, or you are invited to
export function filterRecommendedEvents(
  events,
  userId,
  friendsIds = [],
  invitedEventIds = []
) {
  return events.filter((e) => {
    // Friends participating
    const hasFriend = e.participants?.some((p) =>
      friendsIds.includes(p.user?.id)
    );
    // Invited
    const isInvited = invitedEventIds.includes(e.id);
    return hasFriend || isInvited;
  });
}

// 6. Popular Events: most participants this week
export function filterPopularEvents(events, count = 10) {
  return events
    .filter((e) => {
      const start = new Date(e.start_time);
      return start >= startOfWeek && start <= endOfWeek;
    })
    .sort(
      (a, b) => (b.participants?.length || 0) - (a.participants?.length || 0)
    )
    .slice(0, count);
}

/**
 * Invite a user to a private event, send a chat message, and create a notification.
 * Only the event owner can invite, and only users they follow.
 */
export const inviteUserToPrivateEvent = async ({
  eventId,
  inviteeId,
  inviterId,
}) => {
  try {
    // Start a transaction
    const { data: result, error: transactionError } = await supabase.rpc(
      "invite_user_to_private_event",
      {
        p_event_id: eventId,
        p_invitee_id: inviteeId,
        p_inviter_id: inviterId,
      }
    );

    if (transactionError) {
      console.error("Transaction error:", transactionError);
      throw transactionError;
    }

    // If we have a chat room ID from the transaction, send the chat message
    if (result.chat_room_id) {
      try {
        const invitationContent = JSON.stringify({
          eventId,
          title: result.event.title,
          description: result.event.description,
          location: result.event.location,
          start_time: result.event.start_time,
          end_time: result.event.end_time,
          image_url: result.event.image_url,
          invitation_id: result.invitation_id,
          user_id: inviteeId,
        });

        await sendMessage(
          result.chat_room_id,
          inviterId,
          invitationContent,
          "invitation"
        );
      } catch (e) {
        console.error("Error sending chat message:", e);
        // Don't throw here, as the invitation was already created
      }
    }

    return result;
  } catch (error) {
    console.error("Error inviting user to private event:", error);
    throw error;
  }
};

// Accept an event invitation
export async function acceptEventInvitation(invitationId, userId) {
  try {
    console.log("Accepting invitation:", { invitationId, userId });

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from("event_invitations")
      .select("*, events(*)")
      .eq("id", invitationId)
      .single();

    if (invitationError) throw invitationError;
    if (!invitation) throw new Error("Invitation not found");

    // Update the invitation status to accepted
    const { error: updateError } = await supabase
      .from("event_invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId);

    if (updateError) throw updateError;

    // Add or update participant status
    const { error: participantError } = await supabase
      .from("event_participants")
      .upsert(
        {
          event_id: invitation.event_id,
          user_id: userId,
          status: "going",
        },
        {
          onConflict: "event_id,user_id",
          returning: "minimal",
        }
      );

    if (participantError) throw participantError;

    return {
      data: {
        event_id: invitation.event_id,
        user_id: userId,
        status: "going",
      },
      error: null,
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { data: null, error };
  }
}
