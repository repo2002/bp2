import { useTheme } from "@/hooks/theme";
import useFollowersSubscription from "@/hooks/useFollowersSubscription";
import useFollowersSubscriptionAsFollower from "@/hooks/useFollowersSubscriptionAsFollower";
import { followEvent, unfollowEvent } from "@/services/events";
import {
  cancelFollowRequest,
  followUser,
  getFollowStatus,
  unfollowUser,
} from "@/services/followService";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FollowButton = ({
  userId,
  eventId,
  type = "user", // 'user' (default) or 'event'
  isPrivate = false,
  onFollow,
  onUnfollow,
  onRequest,
  onCancelRequest,
  style,
  isFollowing: isFollowingProp, // for event follow, pass from parent
}) => {
  const theme = useTheme();
  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For event follow, use prop; for user, fetch status
  const isEvent = type === "event";

  const loadFollowStatus = async () => {
    if (isEvent) {
      // For event, use prop if provided
      setStatus(isFollowingProp ? "following" : "none");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await getFollowStatus(userId);
      if (error) throw error;
      setStatus(data.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, eventId, isFollowingProp, type]);

  // Subscribe to changes as follower (user only)
  useFollowersSubscriptionAsFollower(userId, async (payload) => {
    if (!isEvent) await loadFollowStatus();
  });
  useFollowersSubscription(userId, async (payload) => {
    if (!isEvent) await loadFollowStatus();
  });

  const handleFollow = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isEvent) {
        await followEvent(eventId);
        setStatus("following");
        if (onFollow) onFollow(eventId);
      } else {
        const { error } = await followUser(userId);
        if (error) throw error;
        setStatus(isPrivate ? "requested" : "following");
        if (onFollow) onFollow(userId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isEvent) {
        await unfollowEvent(eventId);
        setStatus("none");
        if (onUnfollow) onUnfollow(eventId);
      } else {
        const { error } = await unfollowUser(userId);
        if (error) throw error;
        setStatus("none");
        if (onUnfollow) onUnfollow(userId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await cancelFollowRequest(userId);
      if (error) throw error;
      setStatus("none");
      if (onUnfollow) onUnfollow(userId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case "following":
        return {
          borderWidth: 1,
          borderColor: theme.colors.error,
        };
      case "requested":
        return {
          backgroundColor: theme.colors.grey,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getButtonText = () => {
    if (loading) return "";
    switch (status) {
      case "following":
        return "Unfollow";
      case "requested":
        return "Cancel";
      default:
        return isPrivate ? "Request" : "Follow";
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "following":
        return theme.colors.error;
      case "requested":
        return "black";
      default:
        return "white";
    }
  };

  const handlePress = () => {
    switch (status) {
      case "following":
        handleUnfollow();
        break;
      case "requested":
        handleCancelRequest();
        break;
      default:
        handleFollow();
    }
  };

  if (loading && status === "none") {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.button, getButtonStyle()]}>
          <ActivityIndicator size="small" color="white" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={status === "following" ? theme.colors.text : "white"}
          />
        ) : (
          <Text style={[styles.text, { color: getTextColor() }]}>
            {" "}
            {getButtonText()}{" "}
          </Text>
        )}
      </TouchableOpacity>
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {" "}
          {error}{" "}
        </Text>
      )}
    </View>
  );
};

export default FollowButton;

const styles = StyleSheet.create({
  container: {},
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
