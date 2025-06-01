import Avatar from "@/components/Avatar";
import { timeAgo } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const EventNotifications = ({ notification, sender, reference, onPress }) => {
  const theme = useTheme();

  const renderRightContent = () => {
    if (reference?.image) {
      return (
        <Image
          source={{ uri: reference.image }}
          style={styles.image}
          contentFit="cover"
        />
      );
    }
    return (
      <View style={styles.eventActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => onPress?.("accept")}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onPress?.("deny")}
          style={styles.denyButton}
        >
          <Ionicons name="close" size={16} color={theme.colors.greyDark} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.cardBackground,
        },
      ]}
    >
      <View
        style={[
          styles.iconHeader,
          {
            backgroundColor: "#ff9800", // Orange for events
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={14} color={"white"} />
        {!notification.is_read && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.error,
              marginRight: 4,
            }}
          />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={styles.textContainer}>
            <Avatar uri={sender?.image_url} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: theme.colors.text }}>
                <Text style={{ fontWeight: "bold" }}>
                  {sender?.username || "Someone"}{" "}
                </Text>
                <Text>invited you to {reference?.title || "an event"} </Text>
                <Text
                  style={{ fontWeight: "bold", color: theme.colors.greyDark }}
                >
                  {timeAgo(notification.created_at)}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightContent}>{renderRightContent()}</View>
      </View>
    </View>
  );
};

export default EventNotifications;

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: "column",
    marginBottom: 4,
    marginTop: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flex: 1,
  },
  iconHeader: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  leftContent: {
    flexDirection: "column",
    gap: 4,
    justifyContent: "flex-start",
    padding: 8,
    flex: 1,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rightContent: {
    width: 120,
    alignItems: "flex-end",
    justifyContent: "center",
    marginRight: 12,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  eventActions: {
    width: "100%",
    gap: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});
