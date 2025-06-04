import Avatar from "@/components/Avatar";
import CategoryBadge from "@/components/events/CategoryBadge";
import FollowButton from "@/components/FollowButton";
import ThemeText from "@/components/theme/ThemeText";
import UserChip from "@/components/UserChip";
import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { useEventFollowersSubscription } from "@/hooks/useFollowersSubscription";
import { getEventDetails, updateRSVP } from "@/services/events";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("images");
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) {
      setError("No event ID provided");
      setLoading(false);
      return;
    }
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const eventData = await getEventDetails(id, user?.id);
      if (!eventData) throw new Error("Event not found");
      setEvent(eventData);
      navigation.setOptions({
        title: eventData.title || "Event Details",
      });
      setError(null);
      // Debug logs
      console.log("Permissions:", eventData.permissions);
      console.log("Participants:", eventData.participants);
      console.log("Invites:", eventData.invites);
      console.log("Current user:", user?.id);
    } catch (error) {
      setError(error.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  // Realtime event followers subscription
  useEventFollowersSubscription(
    event?.id && !event.is_private ? event.id : null,
    fetchEventDetails
  );

  // Join/Leave handlers
  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await updateRSVP(event.id, "going");
      await fetchEventDetails();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to join event");
    } finally {
      setActionLoading(false);
    }
  };
  const handleLeave = async () => {
    Alert.alert("Leave Event", "Are you sure you want to leave this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            await updateRSVP(event.id, "left");
            await fetchEventDetails();
          } catch (e) {
            Alert.alert("Error", e.message || "Failed to leave event");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ThemeText>Loading...</ThemeText>
      </View>
    );
  }
  if (error || !event) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ThemeText style={{ color: theme.colors.error }}>
          {error || "Event not found"}
        </ThemeText>
      </View>
    );
  }

  // Short location logic
  const shortLocation =
    event.location?.name || getShortContent(event.location?.address || "", 32);
  const isOwner = event.permissions?.isOwner;
  const isPublic = !event.is_private;
  const canFollow = isPublic && !isOwner;
  const canShare = isPublic && !isOwner;
  const canSeeParticipants =
    isPublic ||
    isOwner ||
    event.permissions?.isParticipant ||
    event.permissions?.isInvited;
  // TODO: Add logic for RSVP/accept/decline/follow/unfollow

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Image Cover + Top Buttons */}
      <View style={styles.coverContainer}>
        {event.images?.[0]?.image_url ? (
          <Image
            source={{ uri: event.images[0].image_url }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.coverImage,
              {
                backgroundColor: theme.colors.grey,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={40}
              color={theme.colors.textSecondary}
            />
          </View>
        )}
        {/* Top left: Back button */}
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: theme.colors.cardBackground },
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        {/* Top right: Settings (owner) or Share (public, not owner) */}
        {isOwner ? (
          <TouchableOpacity
            style={[
              styles.topRightButton,
              { backgroundColor: theme.colors.cardBackground },
            ]}
            onPress={() => {
              /* open settings modal */
            }}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        ) : canShare ? (
          <TouchableOpacity
            style={[
              styles.topRightButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              /* open share bottom sheet */
            }}
          >
            <Ionicons
              name="share-outline"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        ) : null}
        <View style={[styles.bottomRightBadge]}>
          <CategoryBadge category={event.category} />
        </View>
      </View>

      {/* Title & Host */}
      <View style={styles.titleRow}>
        <ThemeText style={styles.title}>{event.title}</ThemeText>
      </View>

      {/* Host Card */}
      <TouchableOpacity
        style={styles.hostRow}
        onPress={() => router.push(`/profile/${event.creator?.id}`)}
      >
        <UserChip user={event.creator} size={40} />
      </TouchableOpacity>

      {/* Description */}
      <ThemeText style={styles.description}>
        {getShortContent(event.description || "", 200)}
      </ThemeText>

      {/* Location Row */}
      <TouchableOpacity
        style={styles.infoRow}
        onPress={() => {
          // TODO /* open map modal */
        }}
      >
        <Ionicons name="location" size={20} color={theme.colors.primary} />
        <ThemeText style={styles.infoRowText}>{shortLocation}</ThemeText>
      </TouchableOpacity>

      {/* Time Row */}
      <View style={styles.infoRow}>
        <Ionicons name="calendar" size={20} color={theme.colors.primary} />
        <ThemeText style={styles.infoRowText}>
          {new Date(event.start_time).toLocaleString()} -{" "}
          {event.end_time ? new Date(event.end_time).toLocaleString() : ""}
        </ThemeText>
      </View>

      {/* Participants Row */}
      {canSeeParticipants && (
        <TouchableOpacity
          style={styles.participantsRow}
          onPress={() => {
            /* open participants modal */
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {(event.participants || []).slice(0, 8).map((p) => (
              <Avatar
                key={p?.id}
                uri={p.user?.image_url}
                size={32}
                style={{
                  marginRight: -8,
                  borderWidth: 2,
                  borderColor: theme.colors.background,
                }}
              />
            ))}
          </View>
          <ThemeText style={styles.participantsCount}>
            {event.participants?.length}
            {event.max_participants ? ` / ${event.max_participants}` : ""}
          </ThemeText>
        </TouchableOpacity>
      )}

      {/* Followers Row */}
      {isPublic && (
        <View style={styles.followersRow}>
          <Ionicons
            name="people-outline"
            size={20}
            color={theme.colors.primary}
          />
          <ThemeText style={styles.followersCount}>
            {event.followers_count?.[0]?.count || 0} follower
            {event.followers_count?.[0]?.count === 1 ? "" : "s"}
          </ThemeText>
        </View>
      )}
      {/* Join/Going and Follow Buttons Row */}
      <View style={styles.actionButtonsRow}>
        {/* Join/Going button */}
        {!isOwner && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: event.permissions?.isParticipant
                  ? theme.colors.success
                  : theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onPress={() => {
              if (event.permissions?.isParticipant) {
                handleLeave();
              } else {
                handleJoin();
              }
            }}
            disabled={actionLoading}
          >
            <ThemeText color="#fff" style={[styles.actionBtnText]}>
              {actionLoading
                ? "..."
                : event.permissions?.isParticipant
                ? "Going"
                : "Join"}
            </ThemeText>
          </TouchableOpacity>
        )}
        {/* FollowButton for public events */}
        {isPublic && !isOwner && (
          <FollowButton
            type="event"
            eventId={event.id}
            isFollowing={event.permissions?.isFollowing}
            onFollow={fetchEventDetails}
            onUnfollow={fetchEventDetails}
            style={styles.actionButton}
          />
        )}
      </View>

      {/* Accept/Decline for private events */}
      {!isPublic && event.permissions?.isInvited && (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.acceptBtn,
              { backgroundColor: theme.colors.success },
            ]}
            onPress={() => {
              // TODO: Implement accept invite logic
            }}
            disabled={actionLoading}
          >
            <ThemeText style={[styles.actionBtnText, { color: "#fff" }]}>
              Accept
            </ThemeText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.declineBtn,
              { backgroundColor: theme.colors.error, marginLeft: 8 },
            ]}
            onPress={() => {
              // TODO: Implement decline invite logic
            }}
            disabled={actionLoading}
          >
            <ThemeText style={[styles.actionBtnText, { color: "#fff" }]}>
              Decline
            </ThemeText>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab("images")}
          style={[
            styles.tab,
            activeTab === "images" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="image-multiple-outline"
            size={20}
            color={
              activeTab === "images" ? theme.colors.primary : theme.colors.text
            }
          />
          <ThemeText
            style={{
              color:
                activeTab === "images"
                  ? theme.colors.primary
                  : theme.colors.text,
              marginLeft: 6,
            }}
          >
            Images
          </ThemeText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("qna")}
          style={[
            styles.tab,
            activeTab === "qna" && {
              borderBottomColor: theme.colors.primary,
              borderBottomWidth: 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="comment-question-outline"
            size={20}
            color={
              activeTab === "qna" ? theme.colors.primary : theme.colors.text
            }
          />
          <ThemeText
            style={{
              color:
                activeTab === "qna" ? theme.colors.primary : theme.colors.text,
              marginLeft: 6,
            }}
          >
            Q&A
          </ThemeText>
        </TouchableOpacity>
      </View>
      {/* Tab Content */}
      {activeTab === "images" ? (
        <View style={{ minHeight: 120, marginBottom: 16 }}>
          {/* TODO: Images grid here */}
          <ThemeText
            style={{
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            Images grid coming soon
          </ThemeText>
        </View>
      ) : (
        <View style={{ minHeight: 120, marginBottom: 16 }}>
          {/* TODO: Q&A grid here */}
          <ThemeText
            style={{
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            Q&A coming soon
          </ThemeText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  coverContainer: { height: 250, position: "relative" },
  coverImage: { width: "100%", height: "100%" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    padding: 8,
    borderRadius: 20,
  },
  topRightButton: {
    position: "absolute",
    top: 40,
    right: 16,
    padding: 8,
    borderRadius: 20,
  },
  bottomRightBadge: {
    position: "absolute",
    bottom: 4,
    right: 16,
    padding: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  title: { fontSize: 26, fontWeight: "bold", flex: 1 },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    gap: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    marginLeft: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  infoRowText: { marginLeft: 8, fontSize: 16 },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  participantsCount: { marginLeft: 12, fontSize: 16, color: "#888" },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  acceptBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  declineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBtnText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  followersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  followersCount: {
    marginLeft: 8,
    fontSize: 16,
    color: "#888",
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 0,
  },
});
