import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ThemeText from "../theme/ThemeText";
import RouteMap from "./RouteMap";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "MMM d, h:mm a");
};

const getLocationAddress = (loc) =>
  typeof loc === "string" ? loc : loc?.address || "";

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
  const { user } = useAuth();

  if (!carpools?.length) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      {carpools.map((carpool) => {
        const confirmedSeats =
          carpool.passengers?.filter((p) => p.status === "confirmed").length ||
          0;
        const myPassenger = carpool.passengers?.find(
          (p) => p.user_id === user?.id
        );
        const requestStatus = myPassenger?.status;

        return (
          <TouchableOpacity
            key={carpool.id}
            style={[
              styles.carpoolCard,
              { backgroundColor: theme.colors.cardBackground },
            ]}
            onPress={() => onCarpoolPress(carpool)}
          >
            <RouteMap
              departure={{
                latitude: carpool.departure_location.latitude,
                longitude: carpool.departure_location.longitude,
                address: getLocationAddress(carpool.departure_location),
              }}
              destination={{
                latitude: carpool.destination_location.latitude,
                longitude: carpool.destination_location.longitude,
                address: getLocationAddress(carpool.destination_location),
              }}
              height={200}
              style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            />
            <View style={{ padding: 16 }}>
              {/* Price Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={theme.colors.primary}
                    style={{ marginRight: 4 }}
                  />
                  <ThemeText color={theme.colors.grey} style={{ fontSize: 14 }}>
                    {confirmedSeats}/{carpool.max_seats} seats
                  </ThemeText>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  {requestStatus && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            requestStatus === "pending"
                              ? theme.colors.warning + "20"
                              : requestStatus === "confirmed"
                              ? theme.colors.success + "20"
                              : theme.colors.error + "20",
                        },
                      ]}
                    >
                      <ThemeText
                        style={[
                          styles.statusText,
                          {
                            color:
                              requestStatus === "pending"
                                ? theme.colors.warning
                                : requestStatus === "confirmed"
                                ? theme.colors.success
                                : theme.colors.error,
                          },
                        ]}
                      >
                        {requestStatus.charAt(0).toUpperCase() +
                          requestStatus.slice(1)}
                      </ThemeText>
                    </View>
                  )}
                  <ThemeText color={theme.colors.primary} style={styles.price}>
                    {carpool.price ? `€${carpool.price}` : "Free"}
                  </ThemeText>
                </View>
              </View>
              {/* Car Info Row */}

              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginBottom: 8,
                  justifyContent: "space-between",
                }}
              >
                {/* Departure Time & Location */}
                <View
                  style={{
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <ThemeText>Departure</ThemeText>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Ionicons
                      name="arrow-up-circle-outline"
                      size={16}
                      color={theme.colors.success}
                      style={{ marginRight: 4 }}
                    />
                    <ThemeText
                      color={theme.colors.text}
                      style={{ fontSize: 13, marginRight: 8 }}
                    >
                      {formatDate(carpool.departure_time)}
                    </ThemeText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={14}
                      color={theme.colors.success}
                      style={{ marginRight: 2 }}
                    />
                    <ThemeText
                      color={theme.colors.text}
                      style={{ fontSize: 13 }}
                    >
                      {getShortContent(
                        getLocationAddress(
                          carpool.departure_location?.description ||
                            getLocationAddress(carpool.departure_location)
                        ),
                        20
                      )}
                    </ThemeText>
                  </View>
                </View>
                {/* Arrival Time & Location */}
                <View
                  style={{
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <ThemeText>Arival</ThemeText>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <Ionicons
                      name="flag-outline"
                      size={16}
                      color={theme.colors.error}
                      style={{ marginRight: 4 }}
                    />
                    <ThemeText
                      color={theme.colors.text}
                      style={{ fontSize: 13, marginRight: 8 }}
                    >
                      {formatDate(carpool.destination_time)}
                    </ThemeText>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="map-marker-outline"
                      size={14}
                      color={theme.colors.error}
                      style={{ marginRight: 2 }}
                    />
                    <ThemeText
                      color={theme.colors.text}
                      style={{ fontSize: 13 }}
                    >
                      {getShortContent(
                        getLocationAddress(
                          carpool.destination_location?.description ||
                            getLocationAddress(carpool.destination_location)
                        ),
                        20
                      )}
                    </ThemeText>
                  </View>
                </View>
              </View>

              {/* Description */}
              {carpool.description && (
                <ThemeText
                  color={theme.colors.grey}
                  style={styles.description}
                  numberOfLines={2}
                >
                  {carpool.description}
                </ThemeText>
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
                  <ThemeText
                    color={theme.colors.grey}
                    style={styles.privateText}
                  >
                    Private
                  </ThemeText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default CarpoolList;
