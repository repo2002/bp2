import EventCardMedium from "@/components/events/EventCardMedium";
import Section from "@/components/events/Section";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useEventList } from "@/hooks/events/useEventList";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

export default function EventInvitationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { events, loading, error, refresh, setFilters } = useEventList();

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      type: "invitations",
    }));
  }, []);

  const handleEventPress = (event) => {
    router.push({
      pathname: `/events/${event.id}`,
      params: { eventTitle: event.title },
    });
  };

  if (loading && !events.length) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.colors.background, flex: 1 },
        ]}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: theme.colors.background, flex: 1 },
        ]}
      >
        <ThemeText style={{ color: theme.colors.error }}>{error}</ThemeText>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Section
        icon={<Ionicons name="mail" size={22} color="#FF6B6B" />}
        title="Event Invitations"
        description="Events you've been invited to"
      >
        {events.map((event) => (
          <EventCardMedium
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
