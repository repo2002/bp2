import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

  const fetchParticipants = async () => {
    try {
      const { data, error: err } = await supabase
        .from("event_participants")
        .select(
          `
          *,
          user:profiles(*)
        `
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (err) throw err;

      setParticipants(data);
      updateStats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStats = (data) => {
    const stats = {
      going: 0,
      maybe: 0,
      notGoing: 0,
      total: data.length,
    };

    data.forEach((participant) => {
      stats[participant.status]++;
    });

    setStats(stats);
  };

  useEffect(() => {
    if (eventId) {
      fetchParticipants();

      // Subscribe to participant changes
      const subscription = supabase
        .channel(`event_participants:${eventId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "event_participants",
            filter: `event_id=eq.${eventId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setParticipants((prev) => [...prev, payload.new]);
              updateStats([...participants, payload.new]);
            } else if (payload.eventType === "DELETE") {
              setParticipants((prev) =>
                prev.filter((p) => p.id !== payload.old.id)
              );
              updateStats(participants.filter((p) => p.id !== payload.old.id));
            } else if (payload.eventType === "UPDATE") {
              setParticipants((prev) =>
                prev.map((p) => (p.id === payload.new.id ? payload.new : p))
              );
              updateStats(
                participants.map((p) =>
                  p.id === payload.new.id ? payload.new : p
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [eventId]);

  const updateStatus = async (status) => {
    try {
      const { error: err } = await supabase.from("event_participants").upsert({
        event_id: eventId,
        user_id: user.id,
        status,
      });

      if (err) throw err;

      // Update local state directly
      const existingParticipant = participants.find(
        (p) => p.user_id === user.id
      );
      if (existingParticipant) {
        setParticipants((prev) =>
          prev.map((p) => (p.user_id === user.id ? { ...p, status } : p))
        );
        updateStats(
          participants.map((p) =>
            p.user_id === user.id ? { ...p, status } : p
          )
        );
      } else {
        const newParticipant = {
          event_id: eventId,
          user_id: user.id,
          status,
          user: user,
        };
        setParticipants((prev) => [...prev, newParticipant]);
        updateStats([...participants, newParticipant]);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeParticipant = async (userId) => {
    try {
      const { error: err } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (err) throw err;

      // Update local state directly
      setParticipants((prev) => prev.filter((p) => p.user_id !== userId));
      updateStats(participants.filter((p) => p.user_id !== userId));
    } catch (err) {
      setError(err.message);
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
