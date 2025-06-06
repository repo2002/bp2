import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { useImageCache } from "@/hooks/useImageCache";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import CategoryBadge from "./CategoryBadge";

export default function EventCard({
  event,
  onPress,
  onRSVP,
  onFollow,
  onUnfollow,
  style,
}) {
  const theme = useTheme();
  const { user } = useAuth();
  const userId = user?.id;
  const router = useRouter();

  // Cache event image
  const { cachedUri: eventImageUri } = useImageCache(event.image_url);

  // Permissions logic (use event.permissions if available, else fallback)
  const isOwner = event.permissions?.isOwner || event.creator_id === userId;
  const isPublic = event.is_private === false;
  const isParticipant =
    event.permissions?.isParticipant ||
    event.participants?.some(
      (p) => p.user?.id === userId && p.status === "going"
    );
  const isFollowing =
    event.permissions?.isFollowing ||
    event.followers?.some((f) => f.user_id === userId || f.user?.id === userId);

  const avatars = event.participants
    ?.map((p) => p.user)
    .filter(Boolean)
    .slice(0, 5);

  // Format date as "01 JAN"
  const dateObj = new Date(event.start_time);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = dateObj
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        style,
        {
          backgroundColor: theme.colors.cardBackground,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow || "#000",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.imageWrapper}>
        {/* Event Image */}
        {eventImageUri ? (
          <Image
            source={{ uri: eventImageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.image, { backgroundColor: theme.colors.greyLight }]}
          >
            <Ionicons name="image" size={32} color={theme.colors.grey} />
          </View>
        )}
        {/* Date badge (top left) */}
        <View style={[styles.dateBadge, { backgroundColor: "white" }]}>
          <ThemeText
            color="black"
            style={{
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            {day}
          </ThemeText>
          <ThemeText color={"red"} style={{ fontSize: 10, fontWeight: "bold" }}>
            {month}
          </ThemeText>
        </View>
        {/* Category badge (top right) */}
        <View style={styles.categoryBadge}>
          <CategoryBadge category={event.category} />
        </View>
        {/* Participant avatars (bottom left) */}
        <View style={styles.participantsRow}>
          {avatars.map((user, idx) => (
            <Avatar
              key={user?.id}
              uri={user?.image_url}
              size={28}
              style={[styles.avatar]}
            />
          ))}
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <ThemeText style={[styles.title]}>{event.title}</ThemeText>
        </View>
        <View style={styles.row}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <ThemeText
            color={theme.colors.primary}
            style={[styles.meta, ,]}
            numberOfLines={1}
          >
            {getShortContent(event.location?.address, 30)}
          </ThemeText>
        </View>
        <View style={styles.row}>
          <Ionicons name="calendar" size={16} color={theme.colors.grey} />
          <ThemeText
            color={theme.colors.grey}
            style={[styles.meta, ,]}
            numberOfLines={1}
          >
            {new Date(event.start_time).toLocaleString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </ThemeText>
        </View>
        <View style={styles.actionsRow}>
          {/* No Join/Going or Follow buttons here anymore */}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: "hidden",
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#e0e0e0",
  },
  dateBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: "center",
    zIndex: 2,
    minWidth: 38,
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
  },
  participantsRow: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
  },
  avatar: {
    position: "relative",
    zIndex: 1,
    borderWidth: 1,
    borderColor: "white",
    marginRight: -10,
  },
  goingText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "500",
  },
  info: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  meta: {
    fontSize: 14,

    flex: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  rsvp: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 8,
    overflow: "hidden",
  },
  followButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
});
