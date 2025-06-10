import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

export function useEventParticipants(eventId) {
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    going: 0,
    maybe: 0,
    notGoing: 0,
    total: 0,
  });
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const imageLoadTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
    };
  }, []);

  const fetchParticipants = async () => {
    if (!eventId || !mountedRef.current) return;

    try {
      // Only abort if there's an existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const { data, error: err } = await supabase
        .from("event_participants")
        .select(
          `
          *,
          user:profiles(*)
        `
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: true })
        .abortSignal(abortControllerRef.current.signal);

      if (err) throw err;

      if (mountedRef.current) {
        // Process user images with a delay to prevent too many simultaneous requests
        const processedData = await Promise.all(
          data.map(async (participant) => {
            if (participant.user?.image_url) {
              // Add a small delay between image loads
              await new Promise((resolve) => {
                imageLoadTimeoutRef.current = setTimeout(resolve, 100);
              });
            }
            return participant;
          })
        );

        setParticipants(processedData);
        updateStats(processedData);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const updateStats = (data) => {
    if (!mountedRef.current) return;

    const newStats = {
      going: 0,
      maybe: 0,
      notGoing: 0,
      total: data.length,
    };

    data.forEach((participant) => {
      newStats[participant.status]++;
    });

    setStats(newStats);
  };

  useEffect(() => {
    if (!eventId || !mountedRef.current) return;

    fetchParticipants();

    // Subscribe to participant changes
    const channel = supabase
      .channel(`event-${eventId}-participants`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;

          setParticipants((prev) => {
            let newParticipants;
            if (payload.eventType === "INSERT") {
              newParticipants = [...prev, payload.new];
            } else if (payload.eventType === "DELETE") {
              newParticipants = prev.filter((p) => p.id !== payload.old.id);
            } else if (payload.eventType === "UPDATE") {
              newParticipants = prev.map((p) =>
                p.id === payload.new.id ? payload.new : p
              );
            }
            // Update stats with new participants list
            updateStats(newParticipants);
            return newParticipants;
          });
        }
      )
      .subscribe();

    return () => {
      if (mountedRef.current) {
        channel.unsubscribe();
      }
    };
  }, [eventId]);

  const updateStatus = async (status) => {
    if (!eventId || !mountedRef.current) return;

    try {
      const { error: err } = await supabase.from("event_participants").upsert({
        event_id: eventId,
        user_id: user.id,
        status,
      });

      if (err) throw err;

      // Update local state directly
      setParticipants((prev) => {
        const existingParticipant = prev.find((p) => p.user_id === user.id);
        let newParticipants;

        if (existingParticipant) {
          newParticipants = prev.map((p) =>
            p.user_id === user.id ? { ...p, status } : p
          );
        } else {
          newParticipants = [
            ...prev,
            {
              event_id: eventId,
              user_id: user.id,
              status,
              user: user,
            },
          ];
        }

        updateStats(newParticipants);
        return newParticipants;
      });
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    }
  };

  const removeParticipant = async (userId) => {
    if (!eventId || !mountedRef.current) return;

    try {
      const { error: err } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (err) throw err;

      // Update local state directly
      setParticipants((prev) => {
        const newParticipants = prev.filter((p) => p.user_id !== userId);
        updateStats(newParticipants);
        return newParticipants;
      });
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    }
  };

  const getParticipantStatus = () => {
    const participant = participants.find((p) => p.user_id === user.id);
    return participant?.status || null;
  };

  const isParticipant = () => {
    return participants.some((p) => p.user_id === user.id);
  };

  const getParticipantsByStatus = (status) => {
    return participants.filter((p) => p.status === status);
  };

  return {
    participants,
    error,
    stats,
    updateStatus,
    removeParticipant,
    getParticipantStatus,
    isParticipant,
    getParticipantsByStatus,
    refresh: fetchParticipants,
  };
}
