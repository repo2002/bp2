import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useRoomSubscription(onChange) {
  useEffect(() => {
    const sub = supabase
      .channel("chat_rooms")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_rooms" },
        onChange
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [onChange]);
}
