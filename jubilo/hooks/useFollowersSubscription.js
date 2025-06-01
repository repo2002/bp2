import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useFollowersSubscription(userId, onChange) {
  useEffect(() => {
    if (!userId) return;

    console.log("Setting up followers subscription for user:", userId);

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
          console.log("Received followers update:", payload);
          try {
            onChange?.(payload);
          } catch (error) {
            console.error("Error in followers subscription callback:", error);
          }
        }
      )
      .subscribe((status) => {
        console.log("Followers subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to followers changes");
        } else if (status === "CLOSED") {
          console.log("Followers subscription closed");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error in followers subscription channel");
        }
      });

    return () => {
      console.log("Cleaning up followers subscription");
      channel.unsubscribe();
    };
  }, [userId, onChange]);
}
