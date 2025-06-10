import EventCard from "@/components/events/EventCard";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import EmptyState from "./EmptyState";
import LoadingIndicator from "./LoadingIndicator";

export default function UserEvents({ userId }) {
  const theme = useTheme();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // If viewing own profile, get all events where user is participant or going
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const isOwnProfile = user?.id === userId;

      // First get events where user is a participant
      const { data: participantEvents, error: participantError } =
        await supabase
          .from("event_participants")
          .select(
            `
          event:events(
            *,
            creator:profiles!creator_id(
              id,
              username,
              first_name,
              last_name,
              image_url
            ),
            participants:event_participants(
              id,
              status,
              user:profiles!user_id(
                id,
                username,
                first_name,
                last_name,
                image_url
              )
            ),
            followers:event_followers(count),
            posts:event_posts(count),
            questions:event_questions(count),
            images:event_images(image_url)
          )
        `
          )
          .eq("user_id", userId)
          .eq("status", "going");

      if (participantError) throw participantError;

      // If viewing own profile, also get events created by the user
      let createdEvents = [];
      if (isOwnProfile) {
        const { data: creatorEvents, error: creatorError } = await supabase
          .from("events")
          .select(
            `
            *,
            creator:profiles!creator_id(
              id,
              username,
              first_name,
              last_name,
              image_url
            ),
            participants:event_participants(
              id,
              status,
              user:profiles!user_id(
                id,
                username,
                first_name,
                last_name,
                image_url
              )
            ),
            followers:event_followers(count),
            posts:event_posts(count),
            questions:event_questions(count),
            images:event_images(image_url)
          `
          )
          .eq("creator_id", userId);

        if (creatorError) throw creatorError;
        createdEvents = creatorEvents || [];
      }

      // Combine and deduplicate events
      const participantEventData = participantEvents?.map((p) => p.event) || [];
      const allEvents = [...participantEventData, ...createdEvents];
      const uniqueEvents = Array.from(
        new Map(allEvents.map((e) => [e.id, e])).values()
      );

      setEvents(uniqueEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleEventPress = (event) => {
    router.push(`/events/${event.id}`);
  };

  if (loading) return <LoadingIndicator text="Loading events..." />;
  if (!events.length) return <EmptyState message="No events yet." />;

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={() => handleEventPress(item)} />
      )}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});
