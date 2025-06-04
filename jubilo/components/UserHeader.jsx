import { useTheme } from "@/hooks/theme";
import useFollowersSubscription from "@/hooks/useFollowersSubscription";
import useFollowersSubscriptionAsFollower from "@/hooks/useFollowersSubscriptionAsFollower";
import { getFollowers, getFollowing } from "@/services/followService";
import { getUserPostCount } from "@/services/postService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Avatar from "./Avatar";
import ThemeText from "./theme/ThemeText";

export default function UserHeader({ user }) {
  const theme = useTheme();
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
  });

  const loadStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [followersRes, followingRes, postsRes] = await Promise.all([
        getFollowers(user.id),
        getFollowing(user.id),
        getUserPostCount(user.id),
      ]);

      setStats({
        followers: followersRes.data?.length || 0,
        following: followingRes.data?.length || 0,
        posts: postsRes.data || 0,
      });
    } catch (error) {
      Error("Error loading user stats:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Subscribe to changes as follower
  useFollowersSubscriptionAsFollower(user?.id, async (payload) => {
    await loadStats();
  });

  // Subscribe to changes as following
  useFollowersSubscription(user?.id, async (payload) => {
    await loadStats();
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={user?.image_url} size={80} />
        <View style={styles.userInfo}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <MaterialCommunityIcons
              name={user?.is_private ? "lock" : "lock-open"}
              size={20}
              color={theme.colors.primary}
            />
            <ThemeText style={{ fontSize: 18, fontWeight: "bold" }}>
              {user?.first_name} {user?.last_name}
            </ThemeText>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flexDirection: "column", gap: 4 }}>
              <ThemeText
                color={theme.colors.grey}
                style={{ fontWeight: "bold", fontSize: 18 }}
              >
                {stats.posts}
              </ThemeText>
              <ThemeText color={theme.colors.grey}>Posts</ThemeText>
            </View>
            <View style={{ flexDirection: "column", gap: 4 }}>
              <ThemeText
                color={theme.colors.grey}
                style={{ fontWeight: "bold", fontSize: 18 }}
              >
                {stats.followers}
              </ThemeText>
              <ThemeText color={theme.colors.grey}>Followers</ThemeText>
            </View>
            <View style={{ flexDirection: "column", gap: 4 }}>
              <ThemeText
                color={theme.colors.grey}
                style={{ fontWeight: "bold", fontSize: 18 }}
              >
                {stats.following}
              </ThemeText>
              <ThemeText color={theme.colors.grey}>Following</ThemeText>
            </View>
          </View>
        </View>
      </View>
      <ThemeText color={theme.colors.grey} style={{ fontSize: 14 }}>
        {user?.bio ?? "No bio"}
      </ThemeText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
});
