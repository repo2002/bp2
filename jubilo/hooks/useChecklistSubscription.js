import { supabase } from "@/lib/supabase";
import { getChecklistForMessage } from "@/services/chatService";
import { useEffect, useState } from "react";

export function useChecklistSubscription(messageId, checklistId) {
  const [checklistData, setChecklistData] = useState(null);
  const [checkedByUserMap, setCheckedByUserMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!messageId || !checklistId) return;

    let isMounted = true;

    async function fetchChecklistAndUsers() {
      setLoading(true);
      try {
        const data = await getChecklistForMessage(messageId);
        if (!isMounted) return;

        setChecklistData(data);

        // Collect all user IDs from checked_by
        const allUserIds = [
          ...new Set(
            (data.items || []).flatMap((item) => item.checked_by || [])
          ),
        ];

        if (allUserIds.length > 0) {
          const { data: users, error } = await supabase
            .from("profiles")
            .select("id, username")
            .in("id", allUserIds);

          if (!error && users && isMounted) {
            const userMap = {};
            users.forEach((u) => {
              userMap[u.id] = u.username;
            });
            setCheckedByUserMap(userMap);
          }
        } else if (isMounted) {
          setCheckedByUserMap({});
        }
      } catch (error) {
        console.error("Error fetching checklist:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Set up real-time subscription
    const channel = supabase
      .channel(`checklist-items-${checklistId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "checklist_items",
          filter: `checklist_id=eq.${checklistId}`,
        },
        async (payload) => {
          if (!isMounted) return;

          // Re-fetch checklist data on any change
          const data = await getChecklistForMessage(messageId);
          if (!isMounted) return;

          setChecklistData(data);

          // Update checkedByUserMap
          const allUserIds = [
            ...new Set(
              (data.items || []).flatMap((item) => item.checked_by || [])
            ),
          ];

          if (allUserIds.length > 0) {
            const { data: users, error } = await supabase
              .from("profiles")
              .select("id, username")
              .in("id", allUserIds);

            if (!error && users && isMounted) {
              const userMap = {};
              users.forEach((u) => {
                userMap[u.id] = u.username;
              });
              setCheckedByUserMap(userMap);
            }
          } else if (isMounted) {
            setCheckedByUserMap({});
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchChecklistAndUsers();

    // Cleanup
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [messageId, checklistId]);

  return {
    checklistData,
    checkedByUserMap,
    loading,
  };
}
