import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EVENTS = [
  {
    id: "1",
    title: "Community Cleanup Day",
    date: "Saturday, March 23",
    time: "9:00 AM - 12:00 PM",
    location: "Central Park",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=500",
    attendees: 45,
  },
  {
    id: "2",
    title: "Neighborhood Book Club",
    date: "Thursday, March 21",
    time: "7:00 PM - 9:00 PM",
    location: "Community Center",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
    attendees: 12,
  },
  {
    id: "3",
    title: "Local Farmers Market",
    date: "Sunday, March 24",
    time: "10:00 AM - 2:00 PM",
    location: "Downtown Square",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500",
    attendees: 89,
  },
];

export default function Events() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={[styles.eventCard, { backgroundColor: theme.colors.card }]}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <ThemeText style={styles.eventTitle}>{item.title}</ThemeText>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.grey}
            />
            <ThemeText
              style={[styles.detailText, { color: theme.colors.grey }]}
            >
              {item.date}
            </ThemeText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.grey} />
            <ThemeText
              style={[styles.detailText, { color: theme.colors.grey }]}
            >
              {item.time}
            </ThemeText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={theme.colors.grey}
            />
            <ThemeText
              style={[styles.detailText, { color: theme.colors.grey }]}
            >
              {item.location}
            </ThemeText>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.attendeesContainer}>
            <Ionicons
              name="people-outline"
              size={16}
              color={theme.colors.primary}
            />
            <ThemeText
              style={[styles.attendees, { color: theme.colors.primary }]}
            >
              {item.attendees} attending
            </ThemeText>
          </View>

          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <ThemeText style={styles.joinButtonText}>Join Event</ThemeText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <ThemeText style={styles.title}>Events</ThemeText>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={EVENTS}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  eventImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  attendeesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attendees: {
    fontSize: 14,
    fontWeight: "500",
  },
  joinButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
