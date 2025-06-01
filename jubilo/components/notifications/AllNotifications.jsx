import { useTheme } from "@/hooks/theme";
import { StyleSheet, View } from "react-native";
import CarpoolNotifications from "./CarpoolNotifications";
import EventNotifications from "./EventNotifications";
import MarketplaceNotifications from "./MarketplaceNotifications";
import SocialNotifications from "./SocialNotifications";

const AllNotifications = ({ notifications = [], onPress }) => {
  const theme = useTheme();

  const renderNotification = (notification) => {
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
          onPress={onPress}
        />
      );
    } else if (notification.reference_type === "event") {
      return (
        <EventNotifications
          key={notification.id}
          notification={notification}
          sender={sender}
          reference={reference}
          onPress={onPress}
        />
      );
    } else if (notification.reference_type === "marketplace") {
      return (
        <MarketplaceNotifications
          key={notification.id}
          notification={notification}
          sender={sender}
          reference={reference}
          onPress={onPress}
        />
      );
    } else if (notification.reference_type === "carpool") {
      return (
        <CarpoolNotifications
          key={notification.id}
          notification={notification}
          sender={sender}
          reference={reference}
          onPress={onPress}
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
        onPress={onPress}
      />
    );
  };

  if (!notifications || notifications.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {notifications.map(renderNotification)}
    </View>
  );
};

export default AllNotifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
