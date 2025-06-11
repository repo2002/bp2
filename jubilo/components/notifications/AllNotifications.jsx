import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { FlatList, StyleSheet, View } from "react-native";
import CarpoolNotifications from "./CarpoolNotifications";
import EventNotifications from "./EventNotifications";
import MarketplaceNotifications from "./MarketplaceNotifications";
import SocialNotifications from "./SocialNotifications";

const AllNotifications = ({ notifications = [], refreshControl }) => {
  const theme = useTheme();

  const renderNotification = ({ item: notification }) => {
    const sender = notification.sender;
    const reference = notification.reference;

    // Determine the type based on reference_type and category
    if (
      ["post", "request"].includes(notification.reference_type) ||
      notification.category === "follow"
    ) {
      return (
        <SocialNotifications
          key={notification.id}
          notification={notification}
          sender={sender}
          reference={reference}
        />
      );
    } else if (notification.reference_type === "event") {
      return (
        <EventNotifications
          key={notification.id}
          notification={notification}
          sender={sender}
          reference={reference}
        />
      );
    } else if (notification.reference_type === "marketplace") {
      return (
        <MarketplaceNotifications
          key={notification.id}
          notification={notification}
          sender={sender}
          reference={reference}
        />
      );
    } else if (notification.reference_type === "carpool") {
      return (
        <CarpoolNotifications
          key={notification.id}
          notification={notification}
          sender={sender}
          reference={reference}
        />
      );
    }
    // Fallback to social notifications if type is unknown
    return (
      <SocialNotifications
        key={notification.id}
        notification={notification}
        sender={sender}
        reference={reference}
      />
    );
  };

  if (!notifications || notifications.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <ThemeText style={styles.emptyText}>No notifications yet</ThemeText>
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id}
      refreshControl={refreshControl}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={null}
    />
  );
};

export default AllNotifications;

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
