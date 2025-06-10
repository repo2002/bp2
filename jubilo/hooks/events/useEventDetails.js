import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getEventDetails } from "@/services/events";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const CACHE_KEY_PREFIX = "event_details_";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useEventDetails(eventId) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const subscriptionsRef = useRef([]);
  const abortControllerRef = useRef(null);
  const { user } = useAuth();

  // Cleanup function
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Unsubscribe from all channels
      subscriptionsRef.current.forEach((subscription) => {
        if (subscription && typeof subscription.unsubscribe === "function") {
          try {
            subscription.unsubscribe();
          } catch (err) {
            console.error("Error unsubscribing:", err);
          }
        }
      });
      subscriptionsRef.current = [];
    };
  }, []);

  const loadCachedData = async () => {
    if (!mountedRef.current) return false;

    try {
      const cached = await AsyncStorage.getItem(
        `${CACHE_KEY_PREFIX}${eventId}`
      );
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          if (mountedRef.current) {
            setEvent(data);
            setLoading(false);
          }
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error loading cached event:", err);
      return false;
    }
  };

  const cacheData = async (data) => {
    if (!mountedRef.current) return;

    try {
      await AsyncStorage.setItem(
        `${CACHE_KEY_PREFIX}${eventId}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Error caching event:", err);
    }
  };

  // Fetch event details with proper cleanup
  const fetchEventDetails = useCallback(async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const eventData = await getEventDetails(eventId, user?.id);

      if (!mountedRef.current) return;

      setEvent(eventData);
      await cacheData(eventData);
      setLoading(false);
    } catch (err) {
      if (!mountedRef.current) return;

      if (err.name === "AbortError") {
        // Ignore abort errors
        return;
      }

      setError(err.message || "Failed to load event details");
      setLoading(false);
    }
  }, [eventId, user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!eventId || !mountedRef.current) return;

    // Single channel for all event-related updates
    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;
          console.log("Event update:", payload);
          setEvent((prev) => ({ ...prev, ...payload.new }));
        }
      )
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
          console.log("Participant update:", payload);
          // Handle participant updates
          if (payload.eventType === "INSERT") {
            setEvent((prev) => ({
              ...prev,
              participants: [...(prev.participants || []), payload.new],
            }));
          } else if (payload.eventType === "DELETE") {
            setEvent((prev) => ({
              ...prev,
              participants: (prev.participants || []).filter(
                (p) => p.id !== payload.old.id
              ),
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_invitations",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;
          console.log("Invitation update:", payload);
          // Handle invitation updates
          if (payload.eventType === "INSERT") {
            setEvent((prev) => ({
              ...prev,
              invitations: [...(prev.invitations || []), payload.new],
            }));
          } else if (payload.eventType === "DELETE") {
            setEvent((prev) => ({
              ...prev,
              invitations: (prev.invitations || []).filter(
                (i) => i.id !== payload.old.id
              ),
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_images",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (!mountedRef.current) return;
          console.log("Image update:", payload);

          // Handle image updates with proper state management
          setEvent((prev) => {
            const currentImages = prev.images || [];

            if (payload.eventType === "INSERT") {
              // Check if image already exists to prevent duplicates
              if (currentImages.some((img) => img.id === payload.new.id)) {
                return prev;
              }

              // Add new image and sort by created_at
              const newImages = [...currentImages, payload.new].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
              );

              return {
                ...prev,
                images: newImages,
              };
            } else if (payload.eventType === "DELETE") {
              return {
                ...prev,
                images: currentImages.filter(
                  (img) => img.id !== payload.old.id
                ),
              };
            } else if (payload.eventType === "UPDATE") {
              return {
                ...prev,
                images: currentImages.map((img) =>
                  img.id === payload.new.id ? payload.new : img
                ),
              };
            }

            return prev;
          });
        }
      )
      .subscribe();

    // Initial fetch
    fetchEventDetails();

    return () => {
      if (mountedRef.current) {
        channel.unsubscribe();
      }
    };
  }, [eventId, fetchEventDetails]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      const cached = await loadCachedData();
      if (!cached) {
        await fetchEventDetails();
      }
    };

    loadData();
  }, [fetchEventDetails]);

  const updateEvent = async (updates) => {
    try {
      const { data, error: err } = await supabase
        .from("events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();

      if (err) throw err;

      if (mountedRef.current) {
        setEvent((prev) => ({
          ...prev,
          ...data,
          permissions: prev.permissions, // Preserve permissions
        }));
        await cacheData(data);
      }
      return data;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    }
  };

  const joinEvent = async (status = "going") => {
    try {
      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (existingParticipant) {
        // Update existing participant status
        const { error: err } = await supabase
          .from("event_participants")
          .update({ status })
          .eq("id", existingParticipant.id);
        if (err) throw err;
      } else {
        // Insert new participant
        const { error: err } = await supabase
          .from("event_participants")
          .insert({
            event_id: eventId,
            user_id: user.id,
            status,
          });
        if (err) throw err;
      }

      // Update local state directly
      if (mountedRef.current) {
        setEvent((prev) => ({
          ...prev,
          participants: existingParticipant
            ? prev.participants.map((p) =>
                p.id === existingParticipant.id ? { ...p, status } : p
              )
            : [
                ...prev.participants,
                {
                  event_id: eventId,
                  user_id: user.id,
                  status,
                  user: user,
                },
              ],
          permissions: {
            ...prev.permissions,
            isParticipant: true,
          },
        }));
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    }
  };

  const leaveEvent = async () => {
    try {
      const { error: err } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (err) throw err;

      // Update local state directly
      if (mountedRef.current) {
        setEvent((prev) => ({
          ...prev,
          participants: prev.participants.filter((p) => p.user_id !== user.id),
          permissions: {
            ...prev.permissions,
            isParticipant: false,
          },
        }));
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
      throw err;
    }
  };

  // Permissions & status helpers
  const isOwner = user?.id && event?.creator_id === user.id;
  const isParticipant = !!event?.participants?.find(
    (p) => p.user?.id === user.id
  );
  const isGoing = !!event?.participants?.find(
    (p) => p.user?.id === user.id && p.status === "going"
  );
  const isInvited = !!event?.invites?.find(
    (i) => i.user?.id === user.id && i.status === "pending"
  );
  const isFollowing = !!event?.followers?.find((f) => f.user?.id === user.id);
  const canEdit = isOwner;
  const canInvite = isOwner && event?.is_private;
  const canUploadImages = isOwner || (event?.allow_guests_to_post && isGoing);
  const canAnswerQnA =
    isOwner || (event?.is_private ? isParticipant : isFollowing);

  return {
    event,
    loading,
    error,
    updateEvent,
    joinEvent,
    leaveEvent,
    refetch: fetchEventDetails,
    permissions: {
      isOwner,
      isParticipant,
      isInvited,
      isFollowing,
      canEdit,
      canInvite,
      canUploadImages,
      canAnswerQnA,
    },
  };
}
