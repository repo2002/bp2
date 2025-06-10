import Avatar from "@/components/Avatar";
import CategoryBadge from "@/components/events/CategoryBadge";
import EventImagesBottomSheet from "@/components/events/EventImagesBottomSheet";
import EventParticipantsModal from "@/components/events/EventParticipantsModal";
import EventQnABottomSheet from "@/components/events/EventQnABottomSheet";
import FollowButton from "@/components/FollowButton";
import ThemeText from "@/components/theme/ThemeText";
import UserChip from "@/components/UserChip";
import { useAuth } from "@/contexts/AuthContext";
import { getShortContent } from "@/helpers/common";
import { useEventDetails } from "@/hooks/events/useEventDetails";
import { useEventParticipants } from "@/hooks/events/useEventParticipants";
import { useEventQnA } from "@/hooks/events/useEventQnA";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("images");
  const [actionLoading, setActionLoading] = useState(false);
  const [imagesSheetOpen, setImagesSheetOpen] = useState(false);
  const [qnaSheetOpen, setQnASheetOpen] = useState(false);
  const [participantsModalVisible, setParticipantsModalVisible] =
    useState(false);

  // Use new hooks
  const {
    event,
    loading,
    error,
    updateEvent,
    joinEvent,
    leaveEvent,
    refresh: refreshEvent,
  } = useEventDetails(id);
  const {
    participants,
    stats,
    updateStatus,
    getParticipantStatus,
    refresh: refreshParticipants,
  } = useEventParticipants(id);

  // Use useEventQnA for all QnA logic
  const {
    questions,
    loading: qnaLoading,
    error: qnaError,
    refresh: refreshQnA,
  } = useEventQnA(id);

  // Compute top question and answer from useEventQnA
  const topQuestion = questions?.length
    ? [...questions].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))[0]
    : null;
  const topAnswer = topQuestion?.answers?.length
    ? [...topQuestion.answers].sort(
        (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
      )[0]
    : null;

  useEffect(() => {
    if (event && navigation && navigation.setOptions) {
      navigation.setOptions({
        title: event.title || "Event Details",
      });
    }
  }, [event, navigation]);

  // Join/Leave handlers
  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await joinEvent("going");
      // No need to refresh event or participants as they're handled by real-time updates
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
            await leaveEvent();
            // No need to refresh event or participants as they're handled by real-time updates
          } catch (e) {
            Alert.alert("Error", e.message || "Failed to leave event");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  // Owner invite section (private events only)
  const showInviteSection =
    event && user && event.creator_id === user.id && event.is_private;

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
  const isOwner = event.creator_id === user.id;
  const isPublic = !event.is_private;
  const isParticipant = participants.some((p) => p.user_id === user.id);
  const canFollow = isPublic && !isOwner;
  const canShare = isPublic && !isOwner;
  const canSeeParticipants =
    isPublic || isOwner || isParticipant || event.permissions?.isInvited;
  const canUploadImages =
    isOwner || (event.allow_guests_to_post && isParticipant);

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
        </View>

        {/* Host Card */}
        <TouchableOpacity
          style={styles.hostRow}
          onPress={() => router.push(`/profile/${event.creator?.id}`)}
        >
          <UserChip user={event.creator} size={40} />
        </TouchableOpacity>

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
            onPress={() => setParticipantsModalVisible(true)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {(participants || []).slice(0, 8).map((p) => (
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
              {participants?.length}
              {event.max_participants ? ` / ${event.max_participants}` : ""}
            </ThemeText>
          </TouchableOpacity>
        )}
        {/* Join/Going and Follow Buttons Row */}
        <View style={styles.actionButtonsRow}>
          {/* Join/Going button */}
          {!isOwner && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: isParticipant
                    ? theme.colors.success
                    : theme.colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
              onPress={() => {
                if (isParticipant) {
                  handleLeave();
                } else {
                  handleJoin();
                }
              }}
              disabled={actionLoading}
            >
              <ThemeText color="#fff" style={[styles.actionBtnText]}>
                {actionLoading ? "..." : isParticipant ? "Going" : "Join"}
              </ThemeText>
            </TouchableOpacity>
          )}
          {/* FollowButton for public events */}
          {isPublic && !isOwner && (
            <FollowButton
              type="event"
              eventId={event.id}
              isFollowing={event.permissions?.isFollowing}
              onFollow={refreshEvent}
              onUnfollow={refreshEvent}
            />
          )}
        </View>

        {/* Images & Q&A Buttons */}
        <View style={styles.sheetButtonsRow}>
          {/* Images row with View All button */}
          <View style={{ width: "100%" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                marginBottom: 4,
              }}
            >
              <ThemeText
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Event Images
              </ThemeText>
              <TouchableOpacity onPress={() => setImagesSheetOpen(true)}>
                <ThemeText
                  color={theme.colors.primary}
                  style={{ fontWeight: "bold" }}
                >
                  View All
                </ThemeText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingLeft: 16, paddingBottom: 8 }}
            >
              {(event.images || []).map((img, idx) => (
                <TouchableOpacity
                  key={img.id || idx}
                  onPress={() => setImagesSheetOpen(true)}
                >
                  <Image
                    source={{ uri: img.image_url }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      marginRight: 8,
                      backgroundColor: theme.colors.border,
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* QnA row with top question and answer */}
          <View style={{ width: "100%", marginTop: 8 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                marginBottom: 4,
              }}
            >
              <ThemeText
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                Top Question
              </ThemeText>
              <TouchableOpacity onPress={() => setQnASheetOpen(true)}>
                <ThemeText
                  color={theme.colors.primary}
                  style={{ fontWeight: "bold" }}
                >
                  View All
                </ThemeText>
              </TouchableOpacity>
            </View>
            {topQuestion ? (
              <TouchableOpacity
                onPress={() => setQnASheetOpen(true)}
                style={[
                  styles.topQuestionCard,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
              >
                <View style={styles.topQuestionHeader}>
                  <Avatar
                    uri={topQuestion.user?.image_url}
                    size={24}
                    style={{ marginRight: 8 }}
                  />
                  <ThemeText style={styles.topQuestionUsername}>
                    {topQuestion.user?.username}
                  </ThemeText>
                  <View style={styles.topQuestionStats}>
                    <Ionicons
                      name="arrow-up-circle"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <ThemeText style={styles.topQuestionUpvotes}>
                      {topQuestion.upvotes || 0}
                    </ThemeText>
                  </View>
                </View>
                <ThemeText style={styles.topQuestionText} numberOfLines={2}>
                  {topQuestion.question}
                </ThemeText>
                {topAnswer && (
                  <View style={styles.topAnswerContainer}>
                    <View style={styles.topAnswerHeader}>
                      <Avatar
                        uri={topAnswer.user?.image_url}
                        size={20}
                        style={{ marginRight: 6 }}
                      />
                      <ThemeText style={styles.topAnswerUsername}>
                        {topAnswer.user?.username}
                      </ThemeText>
                    </View>
                    <ThemeText style={styles.topAnswerText} numberOfLines={2}>
                      {topAnswer.answer}
                    </ThemeText>
                    <View style={styles.topAnswerStats}>
                      <Ionicons
                        name="arrow-up-circle"
                        size={14}
                        color={theme.colors.primary}
                      />
                      <ThemeText style={styles.topAnswerUpvotes}>
                        {topAnswer.upvotes || 0}
                      </ThemeText>
                      <ThemeText style={styles.topAnswerCount}>
                        • {topQuestion.answers?.length || 0} answers
                      </ThemeText>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <ThemeText
                style={{ paddingHorizontal: 16, color: theme.colors.text }}
              >
                No questions yet
              </ThemeText>
            )}
          </View>
        </View>
      </ScrollView>
      {/* Images BottomSheet */}
      <EventImagesBottomSheet
        eventId={event.id}
        visible={imagesSheetOpen}
        onClose={() => setImagesSheetOpen(false)}
        images={event.images}
        canUpload={canUploadImages}
        onUploaded={refreshEvent}
      />

      {/* Q&A BottomSheet */}
      {event?.id && (
        <EventQnABottomSheet
          eventId={event.id}
          visible={qnaSheetOpen}
          onClose={() => setQnASheetOpen(false)}
          canAsk={event.permissions?.canAnswerQnA}
          canAnswer={event.permissions?.canAnswerQnA}
          onQuestionAdded={refreshEvent}
          questions={questions}
        />
      )}

      <EventParticipantsModal
        visible={participantsModalVisible}
        onClose={() => setParticipantsModalVisible(false)}
        participants={participants}
        eventId={event.id}
        inviterId={user.id}
        isPrivate={event.is_private}
        isOwner={event.creator_id === user.id}
      />
    </>
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
  sheetButtonsRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sheetButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sheetButtonText: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
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
  topQuestionCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  topQuestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  topQuestionUsername: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  topQuestionStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topQuestionUpvotes: {
    fontSize: 14,
    color: "#666",
  },
  topQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  topAnswerContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 8,
  },
  topAnswerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  topAnswerUsername: {
    fontSize: 13,
    color: "#666",
  },
  topAnswerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  topAnswerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topAnswerUpvotes: {
    fontSize: 13,
    color: "#666",
  },
  topAnswerCount: {
    fontSize: 13,
    color: "#666",
  },
});
