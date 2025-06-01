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

const RIDES = [
  {
    id: "1",
    user: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    from: "Downtown",
    to: "Westside Mall",
    time: "Today, 2:30 PM",
    seats: 3,
    price: "$5",
  },
  {
    id: "2",
    user: {
      name: "Lisa Wong",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    from: "University Campus",
    to: "Central Park",
    time: "Tomorrow, 9:00 AM",
    seats: 2,
    price: "$4",
  },
  {
    id: "3",
    user: {
      name: "David Kim",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
    from: "Eastside",
    to: "Airport",
    time: "Tomorrow, 3:00 PM",
    seats: 1,
    price: "$8",
  },
];

export default function Carpool() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const renderRide = ({ item }) => (
    <TouchableOpacity
      style={[styles.rideCard, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.rideHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.rideInfo}>
          <ThemeText style={styles.userName}>{item.user.name}</ThemeText>
          <ThemeText style={[styles.time, { color: theme.colors.grey }]}>
            {item.time}
          </ThemeText>
        </View>
        <View style={styles.seatsContainer}>
          <Ionicons name="people" size={16} color={theme.colors.primary} />
          <ThemeText style={[styles.seats, { color: theme.colors.primary }]}>
            {item.seats} seats
          </ThemeText>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View
            style={[styles.dot, { backgroundColor: theme.colors.primary }]}
          />
          <ThemeText style={styles.location}>{item.from}</ThemeText>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View
            style={[styles.dot, { backgroundColor: theme.colors.secondary }]}
          />
          <ThemeText style={styles.location}>{item.to}</ThemeText>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemeText style={[styles.price, { color: theme.colors.primary }]}>
          {item.price}
        </ThemeText>
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
        >
          <ThemeText style={styles.joinButtonText}>Join Ride</ThemeText>
        </TouchableOpacity>
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
        <ThemeText style={styles.title}>Available Rides</ThemeText>
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={RIDES}
        renderItem={renderRide}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ridesList}
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
  ridesList: {
    padding: 16,
    gap: 16,
  },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  rideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  rideInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 14,
  },
  seatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seats: {
    fontSize: 14,
    fontWeight: "500",
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  location: {
    fontSize: 16,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
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
