import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useMessagesSubscription(roomId, onChange) {
  useEffect(() => {
    if (!roomId) return;
    const sub = supabase
      .channel(`chat_messages_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
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
