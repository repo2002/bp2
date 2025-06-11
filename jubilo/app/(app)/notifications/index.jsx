import LoadingIndicator from "@/components/LoadingIndicator";
import AllNotifications from "@/components/notifications/AllNotifications";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import useNotificationsSubscription from "@/hooks/useNotificationsSubscription";
import { fetchNotifications } from "@/services/notificationService";
import { getUserData } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
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

export default function NotificationsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleNotificationDelete = () => {
    Alert.alert(
      "Delete All Notifications",
      "Are you sure you want to delete all notifications? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setNotifications([]);
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
            Notifications
          </ThemeText>
          <TouchableOpacity onPress={handleNotificationDelete}>
            <Ionicons name="trash" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <AllNotifications
        notifications={notifications}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  title: {
    flex: 1,
    textAlign: "center",
  },
});
