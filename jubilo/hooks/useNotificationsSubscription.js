import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function useNotificationsSubscription(onNewNotification) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    console.log("Setting up notifications subscription for user:", user.id);

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Received new notification:", payload);
          if (onNewNotification) {
            onNewNotification(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up notifications subscription");
      channel.unsubscribe();
    };
  }, [user?.id, onNewNotification]);
}
