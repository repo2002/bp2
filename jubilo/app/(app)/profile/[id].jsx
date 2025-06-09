import AcceptButton from "@/components/AcceptButton";
import FollowButton from "@/components/FollowButton";
import ProfileTabs from "@/components/ProfileTabs";
import ThemeText from "@/components/theme/ThemeText";
import UserHeader from "@/components/UserHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import {
  followUser,
  getPendingFollowRequests,
  unfollowUser,
} from "@/services/followService";
import { getUserData } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OtherUserProfile() {
  const { id } = useLocalSearchParams();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [isRequestee, setIsRequestee] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getUserData(id).then((res) => {
        if (res.success) {
          setUser(res.data);
          // Check if both users are following each other
          if (
            res.data.followers?.some((f) => f.id === authUser?.id) &&
            res.data.following?.some((f) => f.id === authUser?.id)
          ) {
            setCanMessage(true);
          } else {
            setCanMessage(false);
          }
        }
        setLoading(false);
      });
    }
  }, [id, authUser]);

  useEffect(() => {
    if (user) {
      // Check for pending follow requests
      getPendingFollowRequests().then((res) => {
        if (res.data && res.data.length > 0) {
          // Find if there's a request between these users
          const request = res.data.find(
            (r) =>
              // We are the requestee if we are the one being followed
              (r.follower.id === authUser?.id && r.followed.id === user.id) ||
              // We are the requester if we are the one following
              (r.follower.id === user.id && r.followed.id === authUser?.id)
          );

          if (request) {
            setPendingRequest(request);
            // If we are the one being followed (requestee), set isRequestee to true
            setIsRequestee(request.follower.id === authUser?.id);
          } else {
            setPendingRequest(null);
            setIsRequestee(false);
          }
        } else {
          setPendingRequest(null);
          setIsRequestee(false);
        }
      });
    }
  }, [user, authUser]);

  const handleFollow = async (userId) => {
    try {
      const { error } = await followUser(userId);
      if (error) throw error;
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const { error } = await unfollowUser(userId);
      if (error) throw error;
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  const handleAccept = () => {
    setPendingRequest(null);
  };

  const handleMessage = () => {
    // TODO: Implement message logic (navigate to chat, etc.)
  };

  if (loading || !user) return <ThemeText>Loading...</ThemeText>;

  const isMe = authUser?.id === user.id;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View
        style={[
          styles.header,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            marginBottom: 8,
            borderBottomWidth: 0.2,
            borderBottomColor: theme.colors.greyDark,
            paddingBottom: 16,
            paddingHorizontal: 16,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemeText style={[styles.title, { fontSize: 20, fontWeight: "bold" }]}>
          {user?.username}
        </ThemeText>
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <UserHeader user={user} />
      </View>
      {!isMe && (
        <View style={styles.actionsRow}>
          {pendingRequest && isRequestee ? (
            // If we are the requestee (being followed), show Accept button
            <AcceptButton
              requestId={pendingRequest.id}
              onAccept={handleAccept}
              style={{ flex: 1 }}
            />
          ) : (
            // If we are the requester or there's no request, show Follow button
            <FollowButton
              userId={user.id}
              isPrivate={user.is_private}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              style={{ flex: 1 }}
            />
          )}
          {canMessage && (
            <TouchableOpacity
              style={[
                styles.button,
                { borderWidth: 1, borderColor: theme.colors.text },
              ]}
              onPress={handleMessage}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={theme.colors.text}
              />
              <ThemeText
                style={[styles.buttonText, { color: theme.colors.text }]}
              >
                Message
              </ThemeText>
            </TouchableOpacity>
          )}
        </View>
      )}
      <ProfileTabs userId={user.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 8,
    borderBottomWidth: 0.2,
    borderBottomColor: "#ccc",
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
