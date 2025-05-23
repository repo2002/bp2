import { View, StyleSheet, Pressable } from "react-native";
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@/convex/_generated/dataModel";

interface MessageBubbleProps {
  message: {
    _id: Id<"messages">;
    senderId: Id<"users">;
    message: string;
    messageType: string;
    messageTime: number;
    isEdited?: boolean;
    isDeleted?: boolean;
    isSeen?: boolean;
    isDelivered?: boolean;
    replyToId?: string;
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  children: React.ReactNode;
}

export const MessageBubble = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
  children,
}: MessageBubbleProps) => {
  const theme = useTheme();

  const getTimeString = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Pressable
      onLongPress={onLongPress}
      onPress={onPress}
      style={[
        styles.container,
        {
          alignSelf: isOwnMessage ? "flex-end" : "flex-start",
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwnMessage
              ? theme.colors.primary
              : theme.colors.greyLight,
          },
        ]}
      >
        {children}
        <View style={styles.footer}>
          {message.isEdited && (
            <ThemeText style={styles.editedText}>edited</ThemeText>
          )}
          <ThemeText
            style={[
              styles.timeText,
              {
                color: isOwnMessage
                  ? theme.colors.background
                  : theme.colors.grey,
              },
            ]}
          >
            {getTimeString(message.messageTime)}
          </ThemeText>
          {isOwnMessage && (
            <View style={styles.statusContainer}>
              {message.isSeen ? (
                <Ionicons
                  name="checkmark-done"
                  size={16}
                  color={theme.colors.background}
                />
              ) : message.isDelivered ? (
                <Ionicons
                  name="checkmark-done"
                  size={16}
                  color={theme.colors.background}
                  style={{ opacity: 0.7 }}
                />
              ) : (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={theme.colors.background}
                  style={{ opacity: 0.7 }}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: "80%",
    marginVertical: 2,
    marginHorizontal: 8,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    minWidth: 60,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  editedText: {
    fontSize: 11,
    fontStyle: "italic",
    marginRight: 4,
  },
  statusContainer: {
    marginLeft: 4,
  },
});
