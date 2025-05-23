import React from "react";
import { StyleSheet } from "react-native";
import { MessageBubble } from "./MessageBubble";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface TextMessageProps {
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
}

export const TextMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
}: TextMessageProps) => {
  return (
    <MessageBubble
      message={message}
      isOwnMessage={isOwnMessage}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <ThemeText
        style={[
          styles.text,
          {
            color: isOwnMessage ? "#FFFFFF" : undefined,
          },
        ]}
      >
        {message.isDeleted ? "(This message was deleted)" : message.message}
      </ThemeText>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 20,
  },
});
