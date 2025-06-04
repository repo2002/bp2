import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useFollowersSubscriptionAsFollower(userId, onChange) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("following-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "followers",
          filter: `follower_id=eq.${userId}`,
        },
        (payload) => {
          try {
            onChange?.(payload);
          } catch (error) {
            console.error("Error in following subscription callback:", error);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, onChange]);
}
