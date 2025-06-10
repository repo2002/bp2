import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getEventDetails } from "@/services/events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const CACHE_KEY_PREFIX = "event_details_";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useEventDetails(eventId) {
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(
        `${CACHE_KEY_PREFIX}${eventId}`
      );
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setEvent(data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error loading cached event:", err);
      return false;
    }
  };

  const cacheData = async (data) => {
    try {
      await AsyncStorage.setItem(
        `${CACHE_KEY_PREFIX}${eventId}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Error caching event:", err);
    }
  };

  const fetchEventDetails = useCallback(
    async (refresh = false) => {
      try {
        if (!refresh && (await loadCachedData())) {
          return;
        }

        const data = await getEventDetails(eventId, user?.id);
        setEvent(data);
        await cacheData(data);
      } catch (err) {
        setError(err.message);
      }
    },
    [eventId, user?.id]
  );

  // Real-time subscriptions
  useEffect(() => {
    if (!eventId) return;

    // Subscribe to event updates
    const eventSubscription = supabase
      .channel(`event:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setEvent((prev) => ({
              ...prev,
              ...payload.new,
              permissions: prev.permissions, // Preserve permissions
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to participant changes
    const participantSubscription = supabase
      .channel(`event_participants:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvent((prev) => ({
              ...prev,
              participants: [...(prev.participants || []), payload.new],
            }));
          } else if (payload.eventType === "DELETE") {
            setEvent((prev) => ({
              ...prev,
              participants: prev.participants.filter(
                (p) => p.id !== payload.old.id
              ),
            }));
          } else if (payload.eventType === "UPDATE") {
            setEvent((prev) => ({
              ...prev,
              participants: prev.participants.map((p) =>
                p.id === payload.new.id ? payload.new : p
              ),
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to invitation changes
    const invitationSubscription = supabase
      .channel(`event_invitations:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_invitations",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchEventDetails(true);
        }
      )
      .subscribe();

    // Subscribe to image changes
    const imageSubscription = supabase
      .channel(`event_images:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_images",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchEventDetails(true);
        }
      )
      .subscribe();

    // Subscribe to question changes
    const questionSubscription = supabase
      .channel(`event_questions:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_questions",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchEventDetails(true);
        }
      )
      .subscribe();

    // Subscribe to answer changes
    const answerSubscription = supabase
      .channel(`event_answers:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_answers",
          filter: `question_id=in.(${event?.questions
            ?.map((q) => q.id)
            .join(",")})`,
        },
        () => {
          fetchEventDetails(true);
        }
      )
      .subscribe();

    // Subscribe to follower changes
    const followerSubscription = supabase
      .channel(`event_followers:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_followers",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setEvent((prev) => ({
              ...prev,
              followers: [...(prev.followers || []), payload.new],
              followers_count: [
                {
                  count: (prev.followers_count?.[0]?.count || 0) + 1,
                },
              ],
              permissions: {
                ...prev.permissions,
                isFollowing:
                  payload.new.user_id === user?.id
                    ? true
                    : prev.permissions.isFollowing,
              },
            }));
          } else if (payload.eventType === "DELETE") {
            setEvent((prev) => ({
              ...prev,
              followers: prev.followers.filter((f) => f.id !== payload.old.id),
              followers_count: [
                {
                  count: (prev.followers_count?.[0]?.count || 0) - 1,
                },
              ],
              permissions: {
                ...prev.permissions,
                isFollowing:
                  payload.old.user_id === user?.id
                    ? false
                    : prev.permissions.isFollowing,
              },
            }));
          }
        }
      )
      .subscribe();

    return () => {
      eventSubscription.unsubscribe();
      participantSubscription.unsubscribe();
      invitationSubscription.unsubscribe();
      imageSubscription.unsubscribe();
      questionSubscription.unsubscribe();
      answerSubscription.unsubscribe();
      followerSubscription.unsubscribe();
    };
  }, [eventId, user?.id]);

  useEffect(() => {
    if (eventId && user?.id) {
      fetchEventDetails();
    }
  }, [eventId, user?.id, fetchEventDetails]);

  const updateEvent = async (updates) => {
    try {
      const { data, error: err } = await supabase
        .from("events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();

      if (err) throw err;

      setEvent((prev) => ({
        ...prev,
        ...data,
        permissions: prev.permissions, // Preserve permissions
      }));
      await cacheData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const joinEvent = async (status = "going") => {
    try {
      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (existingParticipant) {
        // Update existing participant status
        const { error: err } = await supabase
          .from("event_participants")
          .update({ status })
          .eq("id", existingParticipant.id);
        if (err) throw err;
      } else {
        // Insert new participant
        const { error: err } = await supabase
          .from("event_participants")
          .insert({
            event_id: eventId,
            user_id: user.id,
            status,
          });
        if (err) throw err;
      }

      // Update local state directly
      setEvent((prev) => ({
        ...prev,
        participants: existingParticipant
          ? prev.participants.map((p) =>
              p.id === existingParticipant.id ? { ...p, status } : p
            )
          : [
              ...prev.participants,
              {
                event_id: eventId,
                user_id: user.id,
                status,
                user: user,
              },
            ],
        permissions: {
          ...prev.permissions,
          isParticipant: true,
        },
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const leaveEvent = async () => {
    try {
      const { error: err } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (err) throw err;

      // Update local state directly
      setEvent((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.user_id !== user.id),
        permissions: {
          ...prev.permissions,
          isParticipant: false,
        },
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    event,
    error,
    updateEvent,
    joinEvent,
    leaveEvent,
    refresh: () => fetchEventDetails(true),
  };
}
