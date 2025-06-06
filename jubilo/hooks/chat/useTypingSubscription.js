import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useTypingSubscription(roomId, onChange) {
  useEffect(() => {
    if (!roomId) return;
    const sub = supabase
      .channel(`typing_status_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
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
