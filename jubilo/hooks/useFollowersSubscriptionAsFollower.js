import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useFollowersSubscriptionAsFollower(userId, onChange) {
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up following subscription for user:", userId);

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
          console.log("Received following update:", payload);
          try {
            onChange?.(payload);
          } catch (error) {
            console.error("Error in following subscription callback:", error);
          }
        }
      )
      .subscribe((status) => {
        console.log("Following subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to following changes");
        } else if (status === "CLOSED") {
          console.log("Following subscription closed");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error in following subscription channel");
        }
      });

    return () => {
      console.log("Cleaning up following subscription");
      channel.unsubscribe();
    };
  }, [userId, onChange]);
}
