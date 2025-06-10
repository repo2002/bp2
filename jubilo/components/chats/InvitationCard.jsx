import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InvitationCard({
  event,
  onAccept,
  onDecline,
  status,
  currentUserId,
}) {
  const theme = useTheme();
  const router = useRouter();
  let isInvitee = currentUserId === event.user_id;
  const [latestStatus, setLatestStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  // Fetch latest status from DB
  useEffect(() => {
    async function fetchStatus() {
      if (!event.invitation_id) return;
      const { data, error } = await supabase
        .from("event_invitations")
        .select("status")
        .eq("id", event.invitation_id)
        .single();
      if (data) {
        setLatestStatus(data.status);
      }
    }
    fetchStatus();
  }, [event.invitation_id]);

  // Handler to update status after accept/decline
  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept();
      setLatestStatus("accepted");
    } catch (error) {
      console.error("Error accepting invitation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await onDecline();
      setLatestStatus("rejected");
    } catch (error) {
      console.error("Error declining invitation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTitlePress = () => {
    router.push({
      pathname: `/events/${event.eventId}`,
      params: { eventTitle: event.title },
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <View
      style={[styles.card, { backgroundColor: theme.colors.cardBackground }]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={
            latestStatus === "pending" || latestStatus === "declined"
              ? null
              : handleTitlePress
          }
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {event.title}
          </Text>
          <Ionicons
            name="arrow-forward-circle"
            color={theme.colors.primary}
            size={26}
          />
        </TouchableOpacity>
        {event.description && (
          <Text
            style={[styles.desc, { color: theme.colors.grey }]}
            numberOfLines={2}
          >
            {event.description}
          </Text>
        )}
        {event.location?.address && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={theme.colors.primary} />
            <Text style={[styles.info, { color: theme.colors.primary }]}>
              {event.location.address}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={theme.colors.success} />
          <Text style={[styles.info, { color: theme.colors.success }]}>
            {formatDate(event.start_time)}
          </Text>
        </View>
        {event.end_time && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color={theme.colors.error} />
            <Text style={[styles.info, { color: theme.colors.error }]}>
              {formatDate(event.end_time)}
            </Text>
          </View>
        )}
      </View>
      {isInvitee && latestStatus === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.accept, { backgroundColor: theme.colors.primary }]}
            onPress={handleAccept}
            disabled={loading}
          >
            <Text style={styles.acceptText}>{loading ? "..." : "Accept"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.decline, { backgroundColor: theme.colors.error }]}
            onPress={handleDecline}
            disabled={loading}
          >
            <Text style={styles.declineText}>
              {loading ? "..." : "Decline"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {isInvitee && latestStatus === "accepted" && (
        <View style={styles.statusContainer}>
          <Text style={[styles.accepted, { color: theme.colors.primary }]}>
            Accepted 🎉
          </Text>
        </View>
      )}
      {isInvitee && latestStatus === "rejected" && (
        <View style={styles.statusContainer}>
          <Text style={[styles.rejected, { color: theme.colors.error }]}>
            Declined
          </Text>
        </View>
      )}
      {!isInvitee && (
        <View style={styles.statusContainer}>
          <Text style={[styles.info, { color: theme.colors.grey }]}>
            {latestStatus === "pending"
              ? "Invitation sent, waiting for response"
              : latestStatus === "accepted"
              ? "Invitation accepted 🎉"
              : "Invitation declined"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,

    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    marginLeft: 8,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  accept: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  decline: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptText: {
    color: "#fff",
    fontWeight: "bold",
  },
  declineText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statusContainer: {
    padding: 16,
    paddingTop: 0,
    alignItems: "center",
  },
  accepted: {
    fontWeight: "bold",
    fontSize: 16,
  },
  rejected: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
