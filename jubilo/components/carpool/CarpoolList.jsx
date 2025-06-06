import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EmptyState = () => (
  <View style={styles.emptyState}>
    <MaterialIcons name="directions-car" size={48} color="#ccc" />
    <Text style={styles.emptyStateText}>No carpools available</Text>
  </View>
);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${month} ${day}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const CarpoolList = ({ carpools, onCarpoolPress }) => {
  if (!carpools?.length) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      {carpools.map((carpool) => (
        <TouchableOpacity
          key={carpool.id}
          style={styles.carpoolCard}
          onPress={() => onCarpoolPress(carpool)}
        >
          <View style={styles.header}>
            <View style={styles.driverInfo}>
              <Image
                source={{ uri: carpool.driver.image_url }}
                style={styles.driverImage}
              />
              <View>
                <Text style={styles.driverName}>
                  {carpool.driver.first_name} {carpool.driver.last_name}
                </Text>
                <Text style={styles.carInfo}>
                  {carpool.car.brand} {carpool.car.model} • {carpool.car.color}
                </Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${carpool.price}</Text>
              <Text style={styles.seats}>{carpool.max_seats} seats</Text>
            </View>
          </View>

          <View style={styles.route}>
            <View style={styles.routePoint}>
              <MaterialIcons name="location-on" size={20} color="#007AFF" />
              <View style={styles.routeDetails}>
                <Text style={styles.location}>
                  {carpool.departure_location}
                </Text>
                <Text style={styles.time}>
                  {formatDate(carpool.departure_time)}
                </Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <MaterialIcons name="location-on" size={20} color="#007AFF" />
              <View style={styles.routeDetails}>
                <Text style={styles.location}>
                  {carpool.destination_location}
                </Text>
                <Text style={styles.time}>
                  {formatDate(carpool.destination_time)}
                </Text>
              </View>
            </View>
          </View>

          {carpool.description && (
            <Text style={styles.description} numberOfLines={2}>
              {carpool.description}
            </Text>
          )}

          <View style={styles.footer}>
            {carpool.is_recurring && (
              <View style={styles.recurringBadge}>
                <MaterialIcons name="repeat" size={14} color="#007AFF" />
                <Text style={styles.recurringText}>Recurring</Text>
              </View>
            )}
            {carpool.is_private && (
              <View style={styles.privateBadge}>
                <MaterialIcons name="lock" size={14} color="#666" />
                <Text style={styles.privateText}>Private</Text>
              </View>
            )}
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
    color: "#666",
  },
  carpoolCard: {
    backgroundColor: "#fff",
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
    color: "#000",
  },
  carInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  seats: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  route: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  routeDetails: {
    marginLeft: 8,
    flex: 1,
  },
  location: {
    fontSize: 14,
    color: "#000",
  },
  time: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#007AFF",
    marginLeft: 9,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  recurringText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  privateText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});

export default CarpoolList;
