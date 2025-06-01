import FollowButton from "@/components/FollowButton";
import ProfileTabs from "@/components/ProfileTabs";
import ThemeText from "@/components/theme/ThemeText";
import UserHeader from "@/components/UserHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { followUser, unfollowUser } from "@/services/followService";
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
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  useEffect(() => {
    if (id) {
      setLoading(true);
      getUserData(id).then((res) => {
        if (res.success) setUser(res.data);
        setLoading(false);
      });
    }
  }, [id]);

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
          <FollowButton
            userId={user.id}
            isPrivate={user.is_private}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            style={{ flex: 1 }}
          />
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
    gap: 12,
    marginBottom: 12,
    borderBottomWidth: 0.5,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    gap: 8,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
