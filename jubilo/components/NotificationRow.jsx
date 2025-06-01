import { useTheme } from "@/hooks/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function NotificationRow({ notification, sender, reference }) {
  const theme = useTheme();

  const getNotificationText = () => {
    if (!sender) return "Someone";

    switch (notification.category) {
      case "like":
        return `${sender.username} liked your post`;
      case "comment":
        return `${sender.username} commented on your post`;
      case "follow_request":
        return `${sender.username} requested to follow you`;
      default:
        return "New notification";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.category) {
      case "like":
        return "heart";
      case "comment":
        return "comment";
      case "follow_request":
        return "account-plus";
      default:
        return "bell";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={getNotificationIcon()}
          size={24}
          color={theme.colors.primary}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <ThemeText style={styles.text}>{getNotificationText()}</ThemeText>
          <ThemeText style={styles.timestamp}>
            {new Date(notification.created_at).toLocaleDateString()}
          </ThemeText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
