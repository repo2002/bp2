import ErrorMessage from "@/components/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data for development
const MOCK_CARPOOL = {
  id: "1",
  driver_id: "user1",
  car_id: "car1",
  departure_location: "123 Main St, San Francisco",
  departure_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  destination_location: "456 Market St, San Francisco",
  destination_time: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
  max_seats: 3,
  price: 15,
  cost: 10,
  description: "Going to the city center",
  is_private: false,
  is_recurring: false,
  status: "scheduled",
  driver: {
    id: "user1",
    username: "johndoe",
    first_name: "John",
    last_name: "Doe",
    image_url: "https://i.pravatar.cc/150?img=1",
  },
  car: {
    id: "car1",
    brand: "Toyota",
    model: "Camry",
    color: "Silver",
    seats: 5,
  },
};

export default function CarpoolDetailsScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carpool, setCarpool] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchCarpool = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setCarpool(MOCK_CARPOOL);
      } catch (err) {
        setError("Failed to load carpool details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarpool();
  }, [id]);

  const handleJoinCarpool = () => {
    // TODO: Implement join carpool logic
    console.log("Join carpool:", id);
  };

  const handleMessageDriver = () => {
    // TODO: Implement message driver logic
    console.log("Message driver:", carpool?.driver_id);
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Stack.Screen options={{ title: "Carpool Details" }} />
        <LoadingIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Stack.Screen options={{ title: "Carpool Details" }} />
        <ErrorMessage
          message={error}
          onRetry={() => router.replace("/carpools")}
        />
      </View>
    );
  }

  if (!carpool) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Stack.Screen options={{ title: "Carpool Details" }} />
        <ErrorMessage
          message="Carpool not found"
          onRetry={() => router.replace("/carpools")}
        />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Carpool Details" }} />

      <ScrollView style={styles.scrollView}>
        {/* Driver Info */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <View style={styles.driverInfo}>
            <Image
              source={{ uri: carpool.driver.image_url }}
              style={styles.driverImage}
            />
            <View style={styles.driverDetails}>
              <ThemeText style={styles.driverName}>
                {carpool.driver.first_name} {carpool.driver.last_name}
              </ThemeText>
              <ThemeText
                color={theme.colors.grey}
                style={styles.driverUsername}
              >
                @{carpool.driver.username}
              </ThemeText>
            </View>
          </View>
        </View>

        {/* Car Info */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <ThemeText style={styles.sectionTitle}>Car Details</ThemeText>
          <View style={styles.carInfo}>
            <Ionicons name="car" size={24} color={theme.colors.primary} />
            <View style={styles.carDetails}>
              <ThemeText style={styles.carName}>
                {carpool.car.brand} {carpool.car.model}
              </ThemeText>
              <ThemeText color={theme.colors.grey}>
                {carpool.car.color} • {carpool.car.seats} seats
              </ThemeText>
            </View>
          </View>
        </View>

        {/* Route Info */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <ThemeText style={styles.sectionTitle}>Route</ThemeText>
          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <Ionicons
                name="location"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.routeDetails}>
                <ThemeText style={styles.routeLabel}>From</ThemeText>
                <ThemeText>{carpool.departure_location}</ThemeText>
                <ThemeText color={theme.colors.grey}>
                  {new Date(carpool.departure_time).toLocaleString()}
                </ThemeText>
              </View>
            </View>
            <View
              style={[
                styles.routeLine,
                { backgroundColor: theme.colors.greyLight },
              ]}
            />
            <View style={styles.routePoint}>
              <Ionicons
                name="location"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.routeDetails}>
                <ThemeText style={styles.routeLabel}>To</ThemeText>
                <ThemeText>{carpool.destination_location}</ThemeText>
                <ThemeText color={theme.colors.grey}>
                  {new Date(carpool.destination_time).toLocaleString()}
                </ThemeText>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Info */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <ThemeText style={styles.sectionTitle}>
            Additional Information
          </ThemeText>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ThemeText style={styles.infoLabel}>Price</ThemeText>
              <ThemeText style={styles.infoValue}>${carpool.price}</ThemeText>
            </View>
            <View style={styles.infoItem}>
              <ThemeText style={styles.infoLabel}>Available Seats</ThemeText>
              <ThemeText style={styles.infoValue}>
                {carpool.max_seats}
              </ThemeText>
            </View>
            <View style={styles.infoItem}>
              <ThemeText style={styles.infoLabel}>Status</ThemeText>
              <ThemeText style={styles.infoValue}>{carpool.status}</ThemeText>
            </View>
            <View style={styles.infoItem}>
              <ThemeText style={styles.infoLabel}>Type</ThemeText>
              <ThemeText style={styles.infoValue}>
                {carpool.is_recurring ? "Recurring" : "One-time"}
              </ThemeText>
            </View>
          </View>
        </View>

        {/* Description */}
        {carpool.description && (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <ThemeText style={styles.sectionTitle}>Description</ThemeText>
            <ThemeText>{carpool.description}</ThemeText>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionButtons,
          { backgroundColor: theme.colors.cardBackground },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleJoinCarpool}
        >
          <ThemeText color={theme.colors.white} style={styles.buttonText}>
            Join Carpool
          </ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            { borderColor: theme.colors.primary },
          ]}
          onPress={handleMessageDriver}
        >
          <ThemeText color={theme.colors.primary} style={styles.buttonText}>
            Message Driver
          </ThemeText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "600",
  },
  driverUsername: {
    fontSize: 14,
  },
  carInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  carDetails: {
    marginLeft: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: "600",
  },
  routeInfo: {
    marginTop: 8,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  routeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  routeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 12,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  infoItem: {
    width: "50%",
    padding: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtons: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryButton: {
    marginBottom: 8,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
