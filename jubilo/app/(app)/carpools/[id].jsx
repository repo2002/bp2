import RouteMap from "@/components/carpool/RouteMap";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import ThemeText from "@/components/theme/ThemeText";
import UserChip from "@/components/UserChip";
import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { carpoolService } from "@/services/carpool/carpoolService";
import { createGroupChat } from "@/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function CarpoolDetailsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carpool, setCarpool] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    fetchCarpool();
  }, [id]);

  const fetchCarpool = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await carpoolService.getCarpool(id);
      setCarpool(data);
    } catch (err) {
      setError("Failed to load carpool details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCarpool = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setIsJoining(true);
    try {
      await carpoolService.joinCarpool(id);
      await fetchCarpool();
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCarpool = async () => {
    Alert.alert(
      "Leave Carpool",
      "Are you sure you want to leave this carpool?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await carpoolService.leaveCarpool(id);
              await fetchCarpool();
              router.back();
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteCarpool = () => {
    Alert.alert(
      "Delete Carpool",
      "Are you sure you want to delete this carpool?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await carpoolService.deleteCarpool(id);
              router.back();
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  const handleOpenCarpoolChat = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (carpool?.chat_room_id) {
      router.push(`/chats/${carpool.chat_room_id}`);
    } else {
      Alert.alert(
        "Chat not available",
        "This carpool does not have a chat room."
      );
    }
  };

  const isDriver = user?.id === carpool?.driver_id;
  const isPassenger = carpool?.passengers?.some(
    (p) => p.user_id === user?.id && p.status === "confirmed"
  );
  const isPending = carpool?.passengers?.some(
    (p) => p.user_id === user?.id && p.status === "pending"
  );

  const myPassenger = carpool.passengers?.find((p) => p.user_id === user?.id);
  const isCancelled = myPassenger?.status === "cancelled";

  // Handler to create carpool group chat
  const handleCreateCarpoolGroup = async () => {
    if (!carpool) return;
    if (isCreatingChat) return; // Prevent double call
    if (carpool.chat_room_id) {
      Alert.alert(
        "Chat already exists",
        "This carpool already has a group chat."
      );
      return;
    }
    if (confirmedPassengers.length === 0) {
      Alert.alert(
        "No passengers",
        "You need at least one confirmed passenger to create a group chat."
      );
      return;
    }
    setIsCreatingChat(true);
    try {
      const chatName = `Carpool: ${getShortContent(
        carpool.description || "Carpool",
        20
      )}`;
      const participantIds = [
        carpool.driver_id,
        ...confirmedPassengers.map((p) => p.user_id),
      ];
      const {
        success,
        data: chatRoom,
        error,
      } = await createGroupChat(carpool.driver_id, chatName, participantIds);
      if (success && chatRoom?.id) {
        console.log(
          "Attempting to update carpool",
          carpool.id,
          "with chat_room_id",
          chatRoom.id
        );
        const { data: updateResult, error: updateError } =
          await carpoolService.updateCarpool(carpool.id, {
            chat_room_id: chatRoom.id,
          });
        if (updateError) {
          console.error(
            "Error updating carpool with chat_room_id:",
            updateError
          );
          Alert.alert(
            "Error",
            updateError.message || "Failed to update carpool with chat room"
          );
        } else {
          console.log("Carpool updated with chat_room_id:", updateResult);
          setCarpool((prev) => ({ ...prev, chat_room_id: chatRoom.id }));
          Alert.alert("Success", "Carpool group chat created!");
          fetchCarpool();
        }
      } else {
        Alert.alert("Error", error || "Failed to create chat room");
      }
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create chat room");
    } finally {
      setIsCreatingChat(false);
    }
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
        <ErrorMessage message={error} onRetry={fetchCarpool} />
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
          onRetry={() => router.back()}
        />
      </View>
    );
  }

  const confirmedPassengers =
    carpool.passengers?.filter((p) => p.status === "confirmed") || [];
  const pendingPassengers =
    carpool.passengers?.filter((p) => p.status === "pending") || [];
  const availableSeats = carpool.max_seats - confirmedPassengers.length;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Carpool Details" }} />

      <ScrollView style={styles.scrollView}>
        <View>
          {/* Route Map */}
          <RouteMap
            departure={
              carpool.departure_location && {
                latitude: carpool.departure_location?.latitude,
                longitude: carpool.departure_location?.longitude,
                address:
                  carpool.departure_location?.description ||
                  carpool.departure_location?.address,
              }
            }
            destination={
              carpool.destination_location && {
                latitude: carpool.destination_location?.latitude,
                longitude: carpool.destination_location?.longitude,
                address:
                  carpool.destination_location?.description ||
                  carpool.destination_location?.address,
              }
            }
            height={400}
          />
          <TouchableOpacity
            onPress={router.back}
            style={{
              position: "absolute",
              top: 32,
              left: 6,
              backgroundColor: theme.colors.grey,
              padding: 8,
              borderRadius: 50,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={"black"} />
          </TouchableOpacity>
          {isDriver && (
            <View
              style={{
                position: "absolute",
                bottom: 12,
                right: 4,
                flexDirection: "row",
                gap: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.error,
                  padding: 8,
                  borderRadius: 50,
                }}
                onPress={handleDeleteCarpool}
              >
                <Ionicons name="trash" size={20} color={"white"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* Driver Info */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <View style={styles.driverInfo}>
            <UserChip
              user={carpool.driver}
              size={40}
              subtitle={`${carpool.driver.first_name} ${carpool.driver.last_name}`}
            />
            {!isDriver && (
              <TouchableOpacity
                style={[
                  styles.messageButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleOpenCarpoolChat}
              >
                <Ionicons name="chatbubble-outline" size={20} color="white" />
              </TouchableOpacity>
            )}
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
                {carpool.car?.make} {carpool.car?.model}
              </ThemeText>
              <ThemeText color={theme.colors.grey}>
                {carpool.car?.color} • {carpool.car?.seats} seats
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
                color={theme.colors.success}
              />
              <View style={styles.routeDetails}>
                <ThemeText style={styles.routeLabel}>From</ThemeText>
                <ThemeText>
                  {carpool.departure_location?.description ||
                    carpool.departure_location?.address}
                </ThemeText>
                <ThemeText color={theme.colors.grey}>
                  {carpool.departure_time
                    ? format(new Date(carpool.departure_time), "MMM d, h:mm a")
                    : "-"}
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
              <Ionicons name="location" size={24} color={theme.colors.error} />
              <View style={styles.routeDetails}>
                <ThemeText style={styles.routeLabel}>To</ThemeText>
                <ThemeText>
                  {carpool.destination_location?.description ||
                    carpool.destination_location?.address}
                </ThemeText>
                <ThemeText color={theme.colors.grey}>
                  {carpool.destination_time
                    ? format(
                        new Date(carpool.destination_time),
                        "MMM d, h:mm a"
                      )
                    : "-"}
                </ThemeText>
              </View>
            </View>
          </View>
        </View>

        {/* Event Info */}
        {carpool.event_id && (
          <View
            style={[
              styles.section,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <ThemeText style={styles.sectionTitle}>Event</ThemeText>
            <TouchableOpacity
              style={styles.eventInfo}
              onPress={() => router.push(`/events/${carpool.event_id}`)}
            >
              <Ionicons
                name="calendar"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.eventDetails}>
                <ThemeText style={styles.eventName}>
                  {carpool.event_title}
                </ThemeText>
                <ThemeText color={theme.colors.grey}>
                  {format(new Date(carpool.event_time), "MMM d, h:mm a")}
                </ThemeText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={theme.colors.grey}
              />
            </TouchableOpacity>
          </View>
        )}

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
              <ThemeText style={styles.infoValue}>
                €{carpool.price ?? "Free"}
              </ThemeText>
            </View>
            <View style={styles.infoItem}>
              <ThemeText style={styles.infoLabel}>Available Seats</ThemeText>
              <ThemeText style={styles.infoValue}>
                {availableSeats} of {carpool.max_seats ?? "-"}
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

        {/* Participants */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <ThemeText style={styles.sectionTitle}>Passengers</ThemeText>
          {confirmedPassengers.length > 0 ? (
            <View style={styles.participantsList}>
              {confirmedPassengers.map((passenger) => (
                <UserChip
                  key={passenger.id}
                  user={passenger.user}
                  size={40}
                  subtitle={passenger.user.username}
                />
              ))}
            </View>
          ) : (
            <ThemeText color={theme.colors.grey}>No passengers yet</ThemeText>
          )}

          {/* Pending Requests */}
          {isDriver && pendingPassengers.length > 0 && (
            <View style={styles.pendingRequests}>
              <ThemeText style={styles.sectionTitle}>
                Pending Requests
              </ThemeText>
              {pendingPassengers.map((passenger) => (
                <View key={passenger.id} style={styles.pendingRequest}>
                  <UserChip
                    user={passenger.user}
                    size={40}
                    subtitle={passenger.user.username}
                  />
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[
                        styles.requestButton,
                        styles.acceptButton,
                        { backgroundColor: theme.colors.success },
                      ]}
                      onPress={async () => {
                        await carpoolService.updatePassengerStatus(
                          carpool.id,
                          passenger.user_id,
                          "confirmed"
                        );
                        fetchCarpool(); // Refetch to update UI
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.requestButton,
                        styles.rejectButton,
                        { backgroundColor: theme.colors.error },
                      ]}
                      onPress={async () => {
                        await carpoolService.updatePassengerStatus(
                          carpool.id,
                          passenger.user_id,
                          "cancelled"
                        );
                        fetchCarpool(); // Refetch to update UI
                      }}
                    >
                      <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Show Create Carpool Group button if no chat_room_id and user is driver and at least one passenger */}
          {isDriver &&
            !carpool.chat_room_id &&
            confirmedPassengers.length > 0 && (
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  backgroundColor: theme.colors.primary,
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={handleCreateCarpoolGroup}
              >
                <ThemeText
                  color="white"
                  style={{ fontWeight: "bold", fontSize: 16 }}
                >
                  Create Carpool Group
                </ThemeText>
              </TouchableOpacity>
            )}
          {isDriver && carpool.chat_room_id && (
            <TouchableOpacity
              style={{
                marginTop: 16,
                backgroundColor: theme.colors.primary,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => router.push(`/chats/${carpool.chat_room_id}`)}
            >
              <ThemeText
                color="white"
                style={{ fontWeight: "bold", fontSize: 16 }}
              >
                Go to Group Chat
              </ThemeText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isDriver && (
        <View
          style={[
            styles.actionButtons,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          {isCancelled ? (
            <>
              <ThemeText
                color={theme.colors.error}
                style={{ marginBottom: 8, textAlign: "center" }}
              >
                Your request to join this carpool was cancelled.
              </ThemeText>
            </>
          ) : isPassenger ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.dangerButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={handleLeaveCarpool}
            >
              <ThemeText color="white" style={styles.buttonText}>
                Leave Carpool
              </ThemeText>
            </TouchableOpacity>
          ) : isPending ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                { borderColor: theme.colors.grey },
              ]}
              disabled
            >
              <ThemeText color={theme.colors.grey} style={styles.buttonText}>
                Request Pending
              </ThemeText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleJoinCarpool}
              disabled={isJoining || availableSeats <= 0}
            >
              <ThemeText color="white" style={styles.buttonText}>
                {isJoining
                  ? "Joining..."
                  : availableSeats <= 0
                  ? "No Seats Available"
                  : "Join Carpool"}
              </ThemeText>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  messageButton: {
    padding: 8,
    borderRadius: 20,
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
  eventInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDetails: {
    flex: 1,
    marginLeft: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
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
  participantsList: {
    marginTop: 8,
    gap: 12,
  },
  pendingRequest: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  requestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
  dangerButton: {
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
