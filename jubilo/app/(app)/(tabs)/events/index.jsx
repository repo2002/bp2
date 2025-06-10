import EventCardMedium from "@/components/events/EventCardMedium";
import Section from "@/components/events/Section";
import { useAuth } from "@/contexts/AuthContext";
import { useEventList } from "@/hooks/events/useEventList";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const {
    events: invitations,
    loading: loadingInvitations,
    updateFilters: updateInvitationFilters,
    refresh: refreshInvitations,
  } = useEventList();
  const {
    events: ownEvents,
    loading: loadingOwn,
    updateFilters: updateOwnFilters,
    refresh: refreshOwn,
  } = useEventList();
  const {
    events: goingEvents,
    loading: loadingGoing,
    updateFilters: updateGoingFilters,
    refresh: refreshGoing,
  } = useEventList();
  const {
    events: upcomingEvents,
    loading: loadingUpcoming,
    updateFilters: updateUpcomingFilters,
    refresh: refreshUpcoming,
  } = useEventList();

  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
        updateInvitationFilters({
          type: "invitations",
          limit: 3,
        });
        updateOwnFilters({
          type: "own",
        });
        updateGoingFilters({
          type: "going",
        });
        updateUpcomingFilters({
          status: "upcoming",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      (async () => {
        try {
          let [place] = await Location.reverseGeocodeAsync({
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          });
          if (place) {
            setUserAddress(
              [
                place.name,
                place.street,
                place.city,
                place.region,
                place.country,
              ]
                .filter(Boolean)
                .join(", ")
            );
          }
        } catch (e) {
          setUserAddress("Unknown location");
        }
      })();
    }
  }, [userLocation]);

  const handleEventPress = (eventId) => {
    router.push(`/events/${eventId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshInvitations(),
        refreshOwn(),
        refreshGoing(),
        refreshUpcoming(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (loadingInvitations && !invitations.length) {
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

  if (loadingOwn && !ownEvents.length) {
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

  if (loadingGoing && !goingEvents.length) {
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

  if (loadingUpcoming && !upcomingEvents.length) {
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Event Invitations Section */}
      {invitations.length > 0 && (
        <Section
          icon={<Ionicons name="mail" size={22} color="#FF6B6B" />}
          title="Event Invitations"
          description="Events you've been invited to"
          onPress={() => router.push("/events/invitations")}
        >
          {invitations.map((event) => (
            <EventCardMedium
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event.id)}
            />
          ))}
        </Section>
      )}

      {/* Your Events Section */}
      {ownEvents.length > 0 && (
        <Section
          icon={<Ionicons name="create" size={22} color="#4a90e2" />}
          title="Your Events"
          description="Events you've created"
          onPress={() => router.push("/events/own")}
        >
          {ownEvents.map((event) => (
            <EventCardMedium
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event.id)}
            />
          ))}
        </Section>
      )}

      {/* Events You're Going To Section */}
      {goingEvents.length > 0 && (
        <Section
          icon={<Ionicons name="checkmark-circle" size={22} color="#6BCB77" />}
          title="Events You're Going To"
          description="Events you've confirmed attendance"
          onPress={() => router.push("/events/going")}
        >
          {goingEvents.map((event) => (
            <EventCardMedium
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event.id)}
            />
          ))}
        </Section>
      )}

      {/* Upcoming Events Section */}
      <Section
        icon={<Ionicons name="calendar" size={22} color="#4a90e2" />}
        title="Upcoming Events"
        description="What's happening soon? Don't miss out!"
        onPress={() => router.push("/events/upcoming")}
      >
        {upcomingEvents.map((event) => (
          <EventCardMedium
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event.id)}
          />
        ))}
      </Section>

      {/* Create Event Button
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/events/create")}
      >
        <Ionicons name="add" size={24} color="white" />
        <ThemeText style={styles.createButtonText}>Create Event</ThemeText>
      </TouchableOpacity> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
