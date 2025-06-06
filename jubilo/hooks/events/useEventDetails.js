import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getEventDetails } from "@/services/events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const CACHE_KEY_PREFIX = "event_details_";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useEventDetails(eventId) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
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
          setLoading(false);
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

  const fetchEventDetails = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!refresh && (await loadCachedData())) {
        return;
      }

      const data = await getEventDetails(eventId, user?.id);
      setEvent(data);
      await cacheData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          fetchEventDetails(true);
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
        () => {
          fetchEventDetails(true);
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

    return () => {
      eventSubscription.unsubscribe();
      participantSubscription.unsubscribe();
      invitationSubscription.unsubscribe();
      imageSubscription.unsubscribe();
      questionSubscription.unsubscribe();
      answerSubscription.unsubscribe();
    };
  }, [eventId, event?.questions]);

  useEffect(() => {
    if (eventId && user?.id) {
      fetchEventDetails();
    }
  }, [eventId, user?.id]);

  const updateEvent = async (updates) => {
    try {
      const { data, error: err } = await supabase
        .from("events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();

      if (err) throw err;

      setEvent(data);
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

      await fetchEventDetails(true);
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

      await fetchEventDetails(true);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    event,
    loading,
    error,
    updateEvent,
    joinEvent,
    leaveEvent,
    refresh: () => fetchEventDetails(true),
  };
}
