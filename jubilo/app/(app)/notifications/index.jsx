import LoadingIndicator from "@/components/LoadingIndicator";
import NotificationRow from "@/components/NotificationRow";
import SocialNotifications from "@/components/notifications/SocialNotifications";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import useNotificationsSubscription from "@/hooks/useNotificationsSubscription";
import { fetchNotifications } from "@/services/notificationService";
import { getUserData } from "@/services/userService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper to fetch reference data based on type
async function fetchReference(reference_type, reference_id) {
  if (!reference_type || !reference_id) return null;
  try {
    switch (reference_type) {
      case "post":
        const { data: post } = await import("@/services/postService").then(
          (m) => m.fetchPostById(reference_id)
        );
        return post;
      case "profile":
        const { data: user } = await getUserData(reference_id);
        return user;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

const REFERENCE_TYPES = [
  { key: "all", icon: "bell-outline" },
  { key: "social", icon: "application" },
];

export default function NotificationsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState("all");

  const handleNotificationDelete = () => {
    const title =
      selectedType === "all"
        ? "Delete All Notifications"
        : `Delete All ${
            selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
          } Notifications`;

    Alert.alert(
      title,
      "Are you sure you want to delete these notifications? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (selectedType === "all") {
              setNotifications([]);
            } else {
              setNotifications(
                notifications.filter((n) => n.category !== selectedType)
              );
            }
          },
        },
      ]
    );
  };

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await fetchNotifications(user.id);
    if (error) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    // Fetch sender and reference data for each notification
    const enriched = await Promise.all(
      (data || []).map(async (notif) => {
        const { data: sender } = await getUserData(notif.sender_id);
        const reference = await fetchReference(
          notif.reference_type,
          notif.reference_id
        );
        return { ...notif, sender, reference };
      })
    );
    setNotifications(enriched);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useNotificationsSubscription((newNotification) => {
    // When a new notification arrives, fetch its sender and reference data
    const enrichNotification = async () => {
      const { data: sender } = await getUserData(newNotification.sender_id);
      const reference = await fetchReference(
        newNotification.reference_type,
        newNotification.reference_id
      );
      setNotifications((prev) => [
        { ...newNotification, sender, reference },
        ...prev,
      ]);
    };
    enrichNotification();
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const filteredNotifications =
    selectedType === "all"
      ? notifications
      : notifications.filter((n) => n.category === selectedType);

  if (loading) return <LoadingIndicator text="Loading notifications..." />;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.colors.greyDark,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemeText
            style={[
              styles.title,
              {
                fontSize: 20,
                fontWeight: "bold",
                textTransform: "capitalize",
                paddingRight: 4,
              },
            ]}
          >
            {selectedType} Notifications
          </ThemeText>
          <TouchableOpacity onPress={handleNotificationDelete}>
            <Ionicons name="trash" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <View
          style={[
            styles.segmentedControl,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {REFERENCE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.segment,
                selectedType === type.key && {
                  backgroundColor: theme.colors.text,
                  shadowColor: "black",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 3,
                },
              ]}
              onPress={() => setSelectedType(type.key)}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={18}
                color={
                  selectedType === type.key
                    ? theme.colors.invertedText
                    : theme.colors.text
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (
            item.category === "follow_request" ||
            item.category === "like" ||
            item.category === "comment"
          ) {
            return (
              <SocialNotifications
                notification={item}
                sender={item.sender}
                reference={item.reference}
              />
            );
          }
          return (
            <NotificationRow
              notification={item}
              sender={item.sender}
              reference={item.reference}
            />
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemeText style={styles.emptyText}>No notifications yet</ThemeText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 0.2,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  segmentedControl: {
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});
