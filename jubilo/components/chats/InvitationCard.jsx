import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InvitationCard({
  event,
  onAccept,
  onDecline,
  status,
  currentUserId,
}) {
  const theme = useTheme();
  const isInvitee = currentUserId === event.user_id;
  const [latestStatus, setLatestStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [cachedImageUri, setCachedImageUri] = useState(null);

  // Cache image on component mount
  useEffect(() => {
    if (event.image_url) {
      cacheImage(event.image_url);
    }
  }, [event.image_url]);

  // Cache image function
  const cacheImage = async (uri) => {
    try {
      const filename = uri.split("/").pop();
      const path = `${FileSystem.cacheDirectory}${filename}`;

      // Check if image is already cached
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        setCachedImageUri(path);
        return;
      }

      // Download and cache image
      await FileSystem.downloadAsync(uri, path);
      setCachedImageUri(path);
    } catch (error) {
      console.error("Error caching image:", error);
      setCachedImageUri(uri); // Fallback to original URL
    }
  };

  // Fetch latest status from DB
  useEffect(() => {
    async function fetchStatus() {
      if (!event.invitation_id) return;
      const { data, error } = await supabase
        .from("event_invitations")
        .select("status")
        .eq("id", event.invitation_id)
        .single();
      if (data && data.status) setLatestStatus(data.status);
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
      {/* Use cached image if available */}
      {event.image_url ? (
        <Image
          source={{ uri: cachedImageUri || event.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.image,
            {
              backgroundColor: theme.colors.greyLight,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Ionicons name="image" size={48} color={theme.colors.grey} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {event.title}
        </Text>
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
            <Ionicons name="location" size={16} color={theme.colors.grey} />
            <Text style={[styles.info, { color: theme.colors.grey }]}>
              {event.location.address}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={16} color={theme.colors.grey} />
          <Text style={[styles.info, { color: theme.colors.grey }]}>
            {formatDate(event.start_time)}
          </Text>
        </View>
        {event.end_time && (
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={theme.colors.grey} />
            <Text style={[styles.info, { color: theme.colors.grey }]}>
              Ends: {formatDate(event.end_time)}
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
    borderRadius: 12,
    marginVertical: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 160,
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
