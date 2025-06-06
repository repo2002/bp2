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
