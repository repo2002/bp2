import { useTheme } from "@/hooks/theme";
import useFollowersSubscription from "@/hooks/useFollowersSubscription";
import useFollowersSubscriptionAsFollower from "@/hooks/useFollowersSubscriptionAsFollower";
import {
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
import ThemeText from "./theme/ThemeText";

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
  }, [userId, eventId, isFollowingProp, type]);

  // Subscribe to changes as follower (user only)
  useFollowersSubscriptionAsFollower(userId, async (payload) => {
    if (!isEvent) {
      // Handle changes when we are the follower
      if (payload.eventType === "INSERT") {
        setStatus(
          payload.new.status === "accepted" ? "following" : "requested"
        );
      } else if (payload.eventType === "DELETE") {
        setStatus("none");
      } else if (payload.eventType === "UPDATE") {
        setStatus(
          payload.new.status === "accepted" ? "following" : "requested"
        );
      }
    }
  });

  // Subscribe to changes as following (user only)
  useFollowersSubscription(userId, async (payload) => {
    if (!isEvent) {
      // Handle changes when we are being followed
      if (payload.eventType === "INSERT") {
        if (payload.new.status === "pending") {
          setStatus("none");
        }
      } else if (payload.eventType === "DELETE") {
        setStatus("none");
      } else if (payload.eventType === "UPDATE") {
        if (payload.new.status === "accepted") {
          setStatus("following");
        }
      }
    }
  });

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (status === "following") {
        await unfollowUser(userId);
        setStatus("none");
        onUnfollow?.();
      } else {
        await followUser(userId);
        setStatus("following");
        onFollow?.();
      }
    } catch (err) {
      console.error("Error handling follow:", err);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = () => {
    if (status === "following") {
      return {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.text,
      };
    }
    return {
      backgroundColor: theme.colors.primary,
    };
  };

  const getButtonText = () => {
    if (loading) return "";
    if (status === "following") {
      return "Following";
    }
    return "Follow";
  };

  const getTextColor = () => {
    if (status === "following") {
      return theme.colors.text;
    }
    return theme.colors.background;
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
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <ThemeText style={[styles.buttonText, { color: getTextColor() }]}>
            {getButtonText()}
          </ThemeText>
        )}
      </TouchableOpacity>
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default FollowButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    fontSize: 12,
    marginLeft: 8,
  },
});
