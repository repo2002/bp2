import ProfilePostThumbnail from "@/components/ProfilePostThumbnail";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { useTheme } from "@/hooks/theme";
import { fetchPostsByUser } from "@/services/postService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import EmptyState from "./EmptyState";
import ThemeText from "./theme/ThemeText";

// Dummy tab data
const TABS = [
  {
    key: "posts",
    label: "Posts",
    icon: "application",
  },
  {
    key: "carpools",
    label: "Carpools",
    icon: "car",
  },
  {
    key: "marketplace",
    label: "Marketplace",
    icon: "shopping-outline",
  },
  {
    key: "events",
    label: "Events",
    icon: "calendar-outline",
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;

function PostsTab({ userId }) {
  const { user } = useAuth();
  const { openCommentSheet, openShareSheet } = useBottomSheet();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await fetchPostsByUser(userId);
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    const { data } = await fetchPostsByUser(userId);
    setPosts(data || []);
    setRefreshing(false);
  };

  if (loading) return <ThemeText>Loading posts...</ThemeText>;
  if (!posts.length) return <EmptyState message="No posts yet." />;

  const handleCommentPress = (post) => openCommentSheet(post);
  const handleSharePress = (post) => openShareSheet(post);

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProfilePostThumbnail post={item} />}
      numColumns={3}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ paddingVertical: 8 }}
    />
  );
}

export default function ProfileTabs({ userId }) {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const panRef = useRef();
  const animValue = useRef(new Animated.Value(0)).current;

  // Animate to a given tab index
  const animateToTab = (newIndex) => {
    Animated.spring(animValue, {
      toValue: -newIndex * SCREEN_WIDTH,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  };

  // Handle tab press
  const handleTabPress = (idx) => {
    setActiveTab(idx);
    animateToTab(idx);
  };

  // Handle swipe gesture
  const panGesture = Gesture.Pan().onEnd((event) => {
    const { translationX } = event;
    let newIndex = activeTab;
    if (translationX < -50 && activeTab < TABS.length - 1) {
      newIndex = activeTab + 1;
    } else if (translationX > 50 && activeTab > 0) {
      newIndex = activeTab - 1;
    }
    if (newIndex !== activeTab) {
      runOnJS(setActiveTab)(newIndex);
      runOnJS(animateToTab)(newIndex);
    } else {
      runOnJS(animateToTab)(activeTab);
    }
  });

  // Render content for each tab
  const renderTabContent = (tabKey) => {
    switch (tabKey) {
      case "posts":
        return <PostsTab userId={userId} />;
      case "carpools":
        return <EmptyState message="No carpools yet." />;
      case "marketplace":
        return <EmptyState message="No marketplace items yet." />;
      case "events":
        return <EmptyState message="No events yet." />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Tab Bar */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 0.2,
          borderColor: theme.colors.grey,
        }}
      >
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab.key}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === idx ? theme.colors.primary : "transparent",
            }}
            onPress={() => handleTabPress(idx)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={22}
              color={
                activeTab === idx ? theme.colors.primary : theme.colors.text
              }
            />
            {/* <ThemeText
              color={
                activeTab === idx ? theme.colors.primary : theme.colors.text
              }
              style={{
                fontWeight: activeTab === idx ? "bold" : "normal",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {tab.label}
            </ThemeText> */}
          </TouchableOpacity>
        ))}
      </View>
      {/* Animated Tab Content with swipe gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={{
            flexDirection: "row",
            width: SCREEN_WIDTH * TABS.length,
            flex: 1,
            transform: [{ translateX: animValue }],
          }}
        >
          {TABS.map((tab, idx) => (
            <View
              key={tab.key}
              style={{
                width: SCREEN_WIDTH,
                flex: 1,
              }}
            >
              {renderTabContent(tab.key)}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
