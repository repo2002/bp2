import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useParticipantsSubscription(roomId, onChange) {
  useEffect(() => {
    if (!roomId) return;
    const sub = supabase
      .channel(`chat_participants_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_participants",
          filter: `room_id=eq.${roomId}`,
        },
        onChange
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [roomId, onChange]);
}

// New: Subscribe to event_participants for a specific event
export function useEventParticipantsSubscription(eventId, onChange) {
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel("event-participants-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          try {
            onChange?.(payload);
          } catch (error) {
            console.error(
              "Error in event participants subscription callback:",
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
