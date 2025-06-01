import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { timeAgo } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import {
  acceptFollowRequest,
  denyFollowRequest,
  followUser,
} from "@/services/followService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SUPABASE_URL = "https://vqkpsuojfxlbbgkxedra.supabase.co";
const BUCKET = "post-images"; // Change to your actual bucket name

const SocialNotifications = ({ notification, sender, reference }) => {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState(notification.status);

  console.log("SocialNotifications reference:", reference);
  console.log("SocialNotifications notification:", notification);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await acceptFollowRequest(notification.reference_id);
      setActionState("accepted");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDeny = async () => {
    setLoading(true);
    setError(null);
    try {
      await denyFollowRequest(notification.reference_id);
      setActionState("denied");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleFollowBack = async () => {
    setLoading(true);
    setError(null);
    try {
      await followUser(sender.id);
      setActionState("followed_back");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleNavigateToPost = () => {
    if (reference && reference.id) {
      router.push(`/post/${reference.id}`);
    }
  };

  const handleNavigateToComment = () => {
    if (
      reference &&
      reference.id &&
      notification.reference_type === "post" &&
      notification.category === "comment"
    ) {
      const commentId = notification.comment_id || notification.id;
      router.push({
        pathname: `/post/${reference.id}`,
        params: { commentId },
      });
    } else {
      handleNavigateToPost();
    }
  };

  // The main notification row is tappable for like/comment
  const isLike = notification.category === "like";
  const isComment = notification.category === "comment";
  const isPostNotification = isLike || isComment;
  const RowWrapper = isPostNotification ? TouchableOpacity : View;
  const rowWrapperProps = isPostNotification
    ? {
        onPress: isLike ? handleNavigateToPost : handleNavigateToComment,
        activeOpacity: 0.8,
      }
    : {};

  let imageUrl = null;
  if (reference?.images?.[0]) {
    // If it's already a full URL, use it as is
    if (reference.images[0].startsWith("http")) {
      imageUrl = reference.images[0];
    } else {
      imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${reference.images[0]}`;
    }
  } else {
    imageUrl =
      reference?.image_url ||
      reference?.photoUrl ||
      reference?.cover ||
      reference?.media?.[0];
  }

  // Thumbnail logic (like ProfilePostThumbnail)
  const hasThumbnail =
    reference?.images && reference.images.length > 0 && reference.images[0];
  const thumbnailUrl = hasThumbnail
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-media/${reference.images[0]}`
    : null;

  return (
    <RowWrapper
      style={[
        styles.container,
        { backgroundColor: theme.colors.cardBackground },
      ]}
      {...rowWrapperProps}
    >
      <View
        style={[
          styles.iconHeader,
          {
            backgroundColor:
              notification.category === "follow_request"
                ? "#9c27b0"
                : "#2196f3",
          },
        ]}
      >
        {notification.category === "follow_request" ? (
          <Ionicons name="person-add-outline" size={14} color={"white"} />
        ) : (
          <MaterialCommunityIcons
            name="application"
            size={14}
            color={"white"}
          />
        )}
        {!notification.is_read && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.error,
              marginRight: 4,
            }}
          />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={styles.textContainer}>
            <Avatar uri={sender?.image_url} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.colors.text }}>
                <Text style={{ fontWeight: "bold" }}>
                  {sender?.username || "Someone"}{" "}
                </Text>
                <Text>
                  {notification.category === "follow_request"
                    ? "requested to follow you"
                    : notification.category === "like"
                    ? "liked your " +
                      (notification.reference_type === "request"
                        ? "request"
                        : "post")
                    : "commented on your " +
                      (notification.reference_type === "request"
                        ? "request"
                        : "post")}{" "}
                </Text>
                <Text
                  style={{ fontWeight: "bold", color: theme.colors.greyDark }}
                >
                  {timeAgo(notification.created_at)}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightContent}>
          {/* Show post thumbnail for like/comment, and actions for follow_request */}
          {notification.category === "like" ||
          notification.category === "comment" ? (
            hasThumbnail ? (
              <Image
                source={{ uri: thumbnailUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.noImageContainer,
                  { backgroundColor: theme.colors.cardBackground },
                ]}
              >
                <ThemeText style={styles.textPreview}>
                  {reference?.content
                    ? reference.content.replace(/<[^>]+>/g, "").slice(0, 40)
                    : "No content"}
                </ThemeText>
              </View>
            )
          ) : (
            notification.category === "follow_request" && (
              <View style={styles.followActions}>
                {actionState === "pending" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={handleAccept}
                      disabled={loading}
                    >
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeny}
                      style={styles.denyButton}
                      disabled={loading}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={theme.colors.greyDark}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {actionState === "accepted" && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.colors.background },
                    ]}
                    onPress={handleFollowBack}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: theme.colors.text },
                      ]}
                    >
                      Follow
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          )}
        </View>
      </View>
      {error && (
        <Text
          style={{ color: theme.colors.error, marginLeft: 16, marginTop: 4 }}
        >
          {error}
        </Text>
      )}
    </RowWrapper>
  );
};

export default SocialNotifications;

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: "column",

    marginBottom: 4,
    marginTop: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flex: 1,
  },
  iconHeader: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  leftContent: {
    flexDirection: "column",
    gap: 4,
    justifyContent: "flex-start",
    padding: 8,
    flex: 1,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightContent: {
    width: 120,
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  followActions: {
    width: "100%",
    gap: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  denyButton: {
    padding: 4,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  noImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 4,
  },
  textPreview: {
    fontSize: 12,
    textAlign: "center",
  },
});
