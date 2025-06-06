import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useEventParticipants(eventId) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
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
          () => {
            fetchParticipants();
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

      await fetchParticipants();
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

      await fetchParticipants();
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
    loading,
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
