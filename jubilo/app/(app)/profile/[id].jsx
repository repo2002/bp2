import AcceptButton from "@/components/AcceptButton";
import FollowButton from "@/components/FollowButton";
import ProfileTabs from "@/components/ProfileTabs";
import RequestButton from "@/components/RequestButton";
import ThemeText from "@/components/theme/ThemeText";
import UserHeader from "@/components/UserHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { createDirectChat } from "@/services/chatService";
import {
  getFollowStatus,
  getPendingFollowRequests,
} from "@/services/followService";
import { getUserData } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OtherUserProfile() {
  const { id } = useLocalSearchParams();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [followStatus, setFollowStatus] = useState("none");
  const [canMessage, setCanMessage] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getUserData(id).then((res) => {
        if (res.success) {
          setUser(res.data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      // Check for pending follow requests
      getPendingFollowRequests().then((res) => {
        if (res.data && res.data.length > 0) {
          // Find if there's a request between these users
          const request = res.data.find((r) => {
            // We are the requestee if the current user is being followed by the profile we're viewing
            return r.follower.id === user.id && r.followed.id === authUser?.id;
          });

          if (request) {
            setPendingRequest(request);
          } else {
            setPendingRequest(null);
          }
        } else {
          setPendingRequest(null);
        }
      });

      // Get follow status
      getFollowStatus(user.id).then(({ data }) => {
        if (data) {
          setFollowStatus(data.status);

          // Check if both users are following each other
          if (data.status === "following") {
            // If we're following them, check if they're following us
            getUserData(authUser?.id).then((res) => {
              if (res.success) {
                const isFollowingBack = res.data.followers?.some(
                  (f) => f.follower.id === user.id
                );
                setCanMessage(isFollowingBack);
              }
            });
          } else {
            setCanMessage(false);
          }
        }
      });
    }
  }, [user, authUser]);

  const handleMessage = async () => {
    try {
      if (!user || !authUser) return;

      const { success, data, error } = await createDirectChat(
        authUser.id,
        user.id
      );

      if (!success) {
        console.error("Error creating/getting chat:", error);
        return;
      }

      // Navigate to the chat screen with the room ID
      router.push(`/chats/${data.id}`);
    } catch (error) {
      console.error("Error in handleMessage:", error);
    }
  };

  if (loading || !user) return <ThemeText>Loading...</ThemeText>;

  const isMe = authUser?.id === user.id;
  const isPrivate = user.is_private;
  const hasPendingRequest = followStatus === "requested";
  const hasIncomingRequest = pendingRequest?.follower.id === user.id;

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
          {hasIncomingRequest ? (
            // Show Accept button if there's an incoming request
            <AcceptButton
              requestId={pendingRequest.id}
              onAccept={() => setPendingRequest(null)}
              style={{ flex: 1 }}
            />
          ) : followStatus === "following" ? (
            // Show Follow button if already following
            <FollowButton
              userId={user.id}
              isFollowing={true}
              style={{ flex: 1 }}
            />
          ) : isPrivate ? (
            // For private users without incoming requests and not following
            <RequestButton
              userId={user.id}
              hasPendingRequest={hasPendingRequest}
              style={{ flex: 1 }}
            />
          ) : (
            // For non-private users without incoming requests and not following
            <FollowButton
              userId={user.id}
              isFollowing={false}
              style={{ flex: 1 }}
            />
          )}
          {canMessage && (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  borderWidth: 1,
                  borderColor: theme.colors.warning,
                },
              ]}
              onPress={handleMessage}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={theme.colors.warning}
              />
              <ThemeText color={theme.colors.warning} style={styles.buttonText}>
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
    alignItems: "center",
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
