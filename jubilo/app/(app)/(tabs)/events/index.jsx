import EventCard from "@/components/events/EventCard";
import EventCardMedium from "@/components/events/EventCardMedium";
import Section from "@/components/events/Section";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import {
  filterFeaturedEvents,
  filterNearYouEvents,
  filterPastEvents,
  filterPopularEvents,
  filterRecommendedEvents,
  filterUpcomingEvents,
  getEvents,
} from "@/services/events";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

export default function EventsIndexScreen() {
  const theme = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;

  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (userLocation) {
      (async () => {
        try {
          // Use Expo Location reverse geocoding
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

  const friendsIds = []; // TODO: fetch from your backend
  const invitedEventIds = []; // TODO: fetch from your backend

  const fetchEvents = useCallback(async () => {
    setRefreshing(true);
    try {
      const { events: fetchedEvents } = await getEvents({ limit: 50 });
      setEvents(fetchedEvents || []);
    } catch (e) {
      // handle error, show toast, etc.
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventPress = (event) => {
    router.push({
      pathname: `/events/${event.id}`,
      params: { eventTitle: event.title },
    });
  };

  if (loading) {
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

  const featuredEvents = filterFeaturedEvents(events);
  const upcomingEvents = filterUpcomingEvents(events);
  const nearYouEvents = filterNearYouEvents(events, userLocation);
  const recommendedEvents = filterRecommendedEvents(
    events,
    userId,
    friendsIds,
    invitedEventIds
  );
  const popularEvents = filterPopularEvents(events);
  const pastEvents = filterPastEvents(events);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* 1. Featured Events */}
      <Section
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
      </Section>

      {/* 2. Upcoming Events */}
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

      {/* 3. Events Near You */}
      <Section
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
      </Section>

      {/* 4. Recommended For You */}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingLeft: 16 }}
        >
          {recommendedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event)}
            />
          ))}
        </ScrollView>
      </Section>

      {/* 5. Popular This Week */}
      <Section
        icon={<FontAwesome5 name="fire" size={20} color="#FF6B81" />}
        title="Popular This Week"
        description="Trending events everyone is talking about."
      >
        {popularEvents.map((event) => (
          <EventCardMedium
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </Section>

      {/* 6. Past Events */}
      <Section
        icon={<Ionicons name="time" size={22} color="#888" />}
        title="Past Events"
        description="Look back at events you've attended or missed."
      >
        {pastEvents.map((event) => (
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
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
