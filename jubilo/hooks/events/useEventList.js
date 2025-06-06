import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const CACHE_KEY = "event_list_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useEventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    status: "upcoming",
    category: null,
    startDate: null,
    endDate: null,
    isPrivate: null,
    type: null, // 'invitations', 'own', 'going'
  });
  const { user } = useAuth();
  const PAGE_SIZE = 10;

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setEvents(data);
          setLoading(false);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error loading cached events:", err);
      return false;
    }
  };

  const cacheData = async (data) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Error caching events:", err);
    }
  };

  const fetchEvents = async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!refresh && (await loadCachedData())) {
        return;
      }

      let query = supabase
        .from("events")
        .select(
          `
          *,
          creator:profiles!events_creator_id_fkey(*),
          participants:event_participants(count),
          followers:event_followers(count),
          images:event_images(id, image_url, is_primary)
          ${
            filters.type === "invitations"
              ? ",invitations:event_invitations!inner(id, status, user_id, inviter_id, created_at)"
              : ",invitations:event_invitations(id, status, user_id, inviter_id, created_at)"
          }
        `
        )
        .order("start_time", { ascending: true })
        .limit(PAGE_SIZE);

      // Apply filters
      if (filters.status === "past") {
        query = query.lt("end_time", new Date().toISOString());
      } else if (filters.status === "upcoming") {
        query = query.gte("end_time", new Date().toISOString());
      }

      // Apply type filters
      if (filters.type === "invitations") {
        query = query
          .eq("invitations.user_id", user.id)
          .eq("invitations.status", "pending");
      } else if (filters.type === "own") {
        query = query.eq("creator_id", user.id);
      } else if (filters.type === "going") {
        query = query
          .eq("event_participants.user_id", user.id)
          .eq("event_participants.status", "going");
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.startDate) {
        query = query.gte("start_time", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("end_time", filters.endDate);
      }
      if (filters.isPrivate !== null) {
        query = query.eq("is_private", filters.isPrivate);
      }

      const { data, error: err } = await query;

      if (err) throw err;

      setEvents(data);
      setHasMore(data.length === PAGE_SIZE);
      await cacheData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const lastEvent = events[events.length - 1];

      let query = supabase
        .from("events")
        .select(
          `
          *,
          creator:profiles!events_creator_id_fkey(*),
          participants:event_participants(count),
          followers:event_followers(count),
          images:event_images(id, image_url, is_primary)
        `
        )
        .order("start_time", { ascending: true })
        .gt("start_time", lastEvent.start_time)
        .limit(PAGE_SIZE);

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.startDate) {
        query = query.gte("start_time", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("end_time", filters.endDate);
      }
      if (filters.isPrivate !== null) {
        query = query.eq("is_private", filters.isPrivate);
      }

      const { data, error: err } = await query;

      if (err) throw err;

      setEvents((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchEvents(true);
  }, [filters]);

  return {
    events,
    loading,
    error,
    hasMore,
    filters,
    updateFilters,
    refresh: () => fetchEvents(true),
    loadMore,
  };
}
