import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface ReplyMessageProps {
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
    replyTo?: {
      _id: Id<"messages">;
      senderId: Id<"users">;
      message: string;
      messageType: string;
      senderName: string;
    };
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
}

export const ReplyMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
}: ReplyMessageProps) => {
  const theme = useTheme();

  if (!message.replyTo) return null;

  return (
    <MessageBubble
      message={message}
      isOwnMessage={isOwnMessage}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.replyContainer,
            {
              borderLeftColor: isOwnMessage
                ? theme.colors.primary
                : theme.colors.grey,
            },
          ]}
        >
          <ThemeText
            style={[
              styles.replySender,
              {
                color: isOwnMessage ? theme.colors.primary : theme.colors.grey,
              },
            ]}
          >
            {message.replyTo.senderName}
          </ThemeText>
          <ThemeText style={styles.replyMessage} numberOfLines={1}>
            {message.replyTo.message}
          </ThemeText>
        </View>
        <ThemeText style={styles.message}>{message.message}</ThemeText>
      </View>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 300,
  },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 4,
  },
  replySender: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  replyMessage: {
    fontSize: 12,
    opacity: 0.8,
  },
  message: {
    fontSize: 14,
  },
});
