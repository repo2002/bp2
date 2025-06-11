import EventCard from "@/components/events/EventCard";
import { useTheme } from "@/hooks/theme";
import { getEvents } from "@/services/events";
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
      const { events: fetchedEvents } = await getEvents({
        userId,
        limit: 50, // Adjust this number based on your needs
      });
      setEvents(fetchedEvents);
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
