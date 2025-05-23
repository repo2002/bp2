import { useEffect, useState } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import ThemeText from "@/components/ThemeText";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import Tabs from "@/components/Tabs";
import { useUser } from "@clerk/clerk-expo";
import { SignOutButton } from "@/components/SignOutButton";

const screenWidth = Dimensions.get("window").width;
const numColumns = 3;
const imageSize = screenWidth / numColumns;

export default function ProfileScreen() {
  const { user } = useUser();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("posts");

  const userProfile = useQuery(api.profile.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  if (!user || !userProfile) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: userProfile?.imageUrl || userProfile.imageUrl }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.userRow}>
              <Ionicons
                name={userProfile?.isPrivate ? "lock-closed" : "lock-open"}
                size={18}
                color={theme.colors.primary}
              />
              <ThemeText style={styles.userName}>
                {userProfile?.firstname || userProfile.firstname}{" "}
                {userProfile?.lastname || userProfile.lastname}
              </ThemeText>
            </View>
            <View style={styles.statsRow}>
              <Stat title="Posts" count={0} />
              <Stat
                title="Followers"
                count={userProfile?.followers?.length || 0}
              />
              <Stat
                title="Following"
                count={userProfile?.following?.length || 0}
              />
            </View>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <ThemeText style={styles.bioText}>
            {userProfile?.bio || "No biography yet."}
          </ThemeText>
        </View>

        <Tabs
          tabs={[
            {
              key: "posts",
              icon: { name: "apps" },
              content: <ThemeText>Posts</ThemeText>,
            },
            {
              key: "events",
              icon: { name: "calendar" },
              content: <ThemeText>Events</ThemeText>,
            },
            {
              key: "saved",
              icon: { name: "heart" },
              content: <ThemeText>Saved</ThemeText>,
            },
            {
              key: "carpools",
              icon: { name: "car-sport" },
              content: <ThemeText>Carpools</ThemeText>,
            },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ title, count }: { title: string; count: number }) {
  const theme = useTheme();
  return (
    <View style={styles.statBlock}>
      <ThemeText style={[styles.statNumber, { color: theme.colors.primary }]}>
        {count}
      </ThemeText>
      <ThemeText color={theme.colors.grey} style={{ fontSize: 14 }}>
        {title}
      </ThemeText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  userInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
  },
  statBlock: {
    alignItems: "flex-start",
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bioContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
