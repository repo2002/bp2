import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

const EmptyState = () => {
  const theme = useTheme();
  return (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="directions-car"
        size={48}
        color={theme.colors.grey}
      />
      <ThemeText color={theme.colors.grey} style={styles.emptyStateText}>
        No carpools available
      </ThemeText>
    </View>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate().toString().padStart(2, "0");
    const month = date
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${day} ${month}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
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
                  {carpool.car.brand} {carpool.car.model} • {carpool.car.color}
                </ThemeText>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <ThemeText color={theme.colors.primary} style={styles.price}>
                ${carpool.price}
              </ThemeText>
              <ThemeText color={theme.colors.grey} style={styles.seats}>
                {carpool.max_seats} seats
              </ThemeText>
            </View>
          </View>

          <View style={styles.route}>
            <View style={styles.routePoint}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.routeDetails}>
                <ThemeText color={theme.colors.text} style={styles.location}>
                  {carpool.departure_location}
                </ThemeText>
                <ThemeText color={theme.colors.grey} style={styles.time}>
                  {formatDate(carpool.departure_time)}
                </ThemeText>
              </View>
            </View>
            <View
              style={[
                styles.routeLine,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View style={styles.routePoint}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.routeDetails}>
                <ThemeText color={theme.colors.text} style={styles.location}>
                  {carpool.destination_location}
                </ThemeText>
                <ThemeText color={theme.colors.grey} style={styles.time}>
                  {formatDate(carpool.destination_time)}
                </ThemeText>
              </View>
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
                  { backgroundColor: theme.colors.cardBackground },
                ]}
              >
                <MaterialIcons
                  name="repeat"
                  size={14}
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
                  { backgroundColor: theme.colors.cardBackground },
                ]}
              >
                <MaterialIcons
                  name="lock"
                  size={14}
                  color={theme.colors.grey}
                />
                <ThemeText color={theme.colors.grey} style={styles.privateText}>
                  Private
                </ThemeText>
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
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 9,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recurringBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
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
});

export default CarpoolList;
