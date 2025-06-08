import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import ThemeText from "../theme/ThemeText";
import RouteMap from "./RouteMap";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "MMM d, h:mm a");
};

const EmptyState = () => {
  const theme = useTheme();
  return (
    <View style={styles.emptyState}>
      <Ionicons name="car" size={48} color={theme.colors.grey} />
      <ThemeText color={theme.colors.grey} style={styles.emptyStateText}>
        No carpools available
      </ThemeText>
    </View>
  );
};

const CarpoolList = ({ carpools, onCarpoolPress }) => {
  const theme = useTheme();

  if (!carpools?.length) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      {carpools.map((carpool) => (
        <TouchableOpacity
          key={carpool.id}
          style={[
            styles.carpoolCard,
            { backgroundColor: theme.colors.cardBackground },
          ]}
          onPress={() => onCarpoolPress(carpool)}
        >
          <View style={styles.header}>
            <View style={styles.driverInfo}>
              <Image
                source={{ uri: carpool.driver.image_url }}
                style={styles.driverImage}
              />
              <View>
                <ThemeText color={theme.colors.text} style={styles.driverName}>
                  {carpool.driver.first_name} {carpool.driver.last_name}
                </ThemeText>
                <ThemeText color={theme.colors.grey} style={styles.carInfo}>
                  {carpool.car.make} {carpool.car.model} • {carpool.car.color}
                </ThemeText>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <ThemeText color={theme.colors.primary} style={styles.price}>
                ${carpool.price}
              </ThemeText>
              <ThemeText color={theme.colors.grey} style={styles.seats}>
                {
                  carpool.passengers.filter((p) => p.status === "confirmed")
                    .length
                }
                /{carpool.max_seats} seats
              </ThemeText>
            </View>
          </View>

          <RouteMap
            departure={{
              latitude: carpool.departure_location.latitude,
              longitude: carpool.departure_location.longitude,
              address: carpool.departure_location.address,
            }}
            destination={{
              latitude: carpool.destination_location.latitude,
              longitude: carpool.destination_location.longitude,
              address: carpool.destination_location.address,
            }}
            style={styles.map}
          />

          <View style={styles.times}>
            <View style={styles.timeContainer}>
              <ThemeText color={theme.colors.grey} style={styles.timeLabel}>
                Departure
              </ThemeText>
              <ThemeText color={theme.colors.text} style={styles.time}>
                {formatDate(carpool.departure_time)}
              </ThemeText>
            </View>
            <View style={styles.timeContainer}>
              <ThemeText color={theme.colors.grey} style={styles.timeLabel}>
                Arrival
              </ThemeText>
              <ThemeText color={theme.colors.text} style={styles.time}>
                {formatDate(carpool.destination_time)}
              </ThemeText>
            </View>
          </View>

          {carpool.description && (
            <ThemeText
              color={theme.colors.grey}
              style={styles.description}
              numberOfLines={2}
            >
              {carpool.description}
            </ThemeText>
          )}

          <View style={styles.footer}>
            {carpool.is_recurring && (
              <View
                style={[
                  styles.recurringBadge,
                  { backgroundColor: theme.colors.primary + "20" },
                ]}
              >
                <Ionicons
                  name="repeat"
                  size={16}
                  color={theme.colors.primary}
                />
                <ThemeText
                  color={theme.colors.primary}
                  style={styles.recurringText}
                >
                  Recurring
                </ThemeText>
              </View>
            )}
            {carpool.is_private && (
              <View
                style={[
                  styles.privateBadge,
                  { backgroundColor: theme.colors.grey + "20" },
                ]}
              >
                <Ionicons
                  name="lock-closed"
                  size={16}
                  color={theme.colors.grey}
                />
                <ThemeText color={theme.colors.grey} style={styles.privateText}>
                  Private
                </ThemeText>
              </View>
            )}
            <View style={styles.statusBadge}>
              <ThemeText
                color={
                  carpool.status === "scheduled"
                    ? theme.colors.primary
                    : carpool.status === "in_progress"
                    ? theme.colors.warning
                    : carpool.status === "completed"
                    ? theme.colors.success
                    : theme.colors.error
                }
                style={styles.statusText}
              >
                {carpool.status.charAt(0).toUpperCase() +
                  carpool.status.slice(1)}
              </ThemeText>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
  },
  carpoolCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
  },
  carInfo: {
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
  },
  seats: {
    fontSize: 14,
    marginTop: 2,
  },
  map: {
    marginBottom: 16,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  timeContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  time: {
    fontSize: 14,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recurringText: {
    fontSize: 12,
    marginLeft: 4,
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    marginLeft: "auto",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default CarpoolList;
