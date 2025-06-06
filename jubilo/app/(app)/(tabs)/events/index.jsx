import EventCardMedium from "@/components/events/EventCardMedium";
import Section from "@/components/events/Section";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useEventList } from "@/hooks/events/useEventList";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

export default function EventsIndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  // Use the new event list hook
  const {
    events,
    loading,
    error,
    refresh,
    setFilters,
    filters,
    loadMore,
    hasMore,
  } = useEventList();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
        setFilters((prev) => ({
          ...prev,
          location: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          },
        }));
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

  // You may want to keep your custom filters, or move them to the hook
  const featuredEvents = events.filter((e) => e.is_featured);
  const upcomingEvents = events.filter(
    (e) => new Date(e.end_time) >= new Date()
  );
  const pastEvents = events.filter((e) => new Date(e.end_time) < new Date());
  const nearYouEvents = userLocation
    ? events.filter((e) => {
        if (!e.location_lat || !e.location_lng) return false;
        // Simple distance check (e.g., within 50km)
        const R = 6371; // km
        const dLat = ((e.location_lat - userLocation.lat) * Math.PI) / 180;
        const dLng = ((e.location_lng - userLocation.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLocation.lat * Math.PI) / 180) *
            Math.cos((e.location_lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d < 50;
      })
    : [];
  // ... keep your other filters as needed ...

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* 1. Featured Events */}
      {/* <Section
        icon={<Ionicons name="star" size={22} color="#FFD93D" />}
        title="Featured Events"
        description="Hand-picked events you shouldn't miss."
      >
        <View>
          {featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event)}
            />
          ))}
        </View>
      </Section> */}

      {/* 1. Event Invitations */}
      <Section
        icon={<Ionicons name="mail" size={22} color="#FF6B6B" />}
        title="Event Invitations"
        description="Events you've been invited to"
        onPress={() => router.push("/events/invitations")}
      >
        <View>
          {events
            .filter((e) =>
              e.invitations?.some(
                (i) => i.user_id === userId && i.status === "pending"
              )
            )
            .slice(0, 3)
            .map((event) => (
              <EventCardMedium
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
              />
            ))}
        </View>
      </Section>

      {/* 2. Your Events */}
      <Section
        icon={<Ionicons name="create" size={22} color="#4a90e2" />}
        title="Your Events"
        description="Events you've created"
        onPress={() => router.push("/events/own")}
      >
        <View>
          {events
            .filter((e) => e.creator_id === userId)
            .slice(0, 3)
            .map((event) => (
              <EventCardMedium
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
              />
            ))}
        </View>
      </Section>

      {/* 3. Events You're Going To */}
      <Section
        icon={<Ionicons name="checkmark-circle" size={22} color="#6BCB77" />}
        title="Events You're Going To"
        description="Events you've confirmed attendance"
        onPress={() => router.push("/events/going")}
      >
        <View>
          {events
            .filter((e) =>
              e.participants?.some(
                (p) => p.user_id === userId && p.status === "going"
              )
            )
            .slice(0, 3)
            .map((event) => (
              <EventCardMedium
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
              />
            ))}
        </View>
      </Section>

      {/* 5. Upcoming Events */}
      <Section
        icon={<Ionicons name="calendar" size={22} color="#4a90e2" />}
        title="Upcoming Events"
        description="What's happening soon? Don't miss out!"
      >
        {upcomingEvents.map((event) => (
          <EventCardMedium
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </Section>

      {/* 6. Past Events */}
      <Section
        icon={<Ionicons name="time" size={22} color="#FF6B6B" />}
        title="Past Events"
        description="Events that have already happened."
      >
        {pastEvents.map((event) => (
          <EventCardMedium
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </Section>

      {/* 7. Events Near You */}
      {/* <Section
        icon={<Ionicons name="location" size={22} color="#6BCB77" />}
        title="Events Near You"
        description={`Discover events happening close to your location. ${
          userAddress ? `(${userAddress})` : ""
        }`}
      >
        {nearYouEvents.map((event) => (
          <EventCardMedium
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </Section> */}

      {/* 8. Recommended For You
      <Section
        icon={
          <MaterialCommunityIcons
            name="account-heart"
            size={22}
            color="#FF6B81"
          />
        }
        title="Recommended For You"
        description="Events we think you'll love, based on your interests."
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event)}
              style={{ width: 370, marginRight: 0 }}
            />
          ))}
        </ScrollView>
      </Section> */}

      {/* 9. Popular This Week */}
      {/* <Section
        icon={<FontAwesome5 name="fire" size={20} color="#FF6B81" />}
        title="Popular This Week"
        description="Trending events everyone is talking about."
      >
        {events.map((event) => (
          <EventCardMedium
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </Section> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
