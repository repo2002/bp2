import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useFollowersSubscription(userId, onChange) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("followers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "followers",
          filter: `following_id=eq.${userId}`,
        },
        (payload) => {
          try {
            onChange?.(payload);
          } catch (error) {
            console.error("Error in followers subscription callback:", error);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, onChange]);
}

// New: Subscribe to event_followers for a specific event
export function useEventFollowersSubscription(eventId, onChange) {
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel("event-followers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_followers",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          try {
            onChange?.(payload);
          } catch (error) {
            console.error(
              "Error in event followers subscription callback:",
              error
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId, onChange]);
}
