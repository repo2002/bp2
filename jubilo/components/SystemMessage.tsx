import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface SystemMessageProps {
  message: {
    _id: Id<"messages">;
    message: string;
    messageType: string;
    messageTime: number;
    metadata?: {
      type: "join" | "leave" | "name_change" | "photo_change" | "admin_change";
      userId?: Id<"users">;
      userName?: string;
      newName?: string;
      newPhotoUrl?: string;
      isAdmin?: boolean;
    };
  };
}

export const SystemMessage = ({ message }: SystemMessageProps) => {
  const theme = useTheme();

  const getMessageContent = () => {
    if (!message.metadata) return message.message;

    const { type, userName, newName, newPhotoUrl, isAdmin } = message.metadata;

    switch (type) {
      case "join":
        return `${userName} joined the chat`;
      case "leave":
        return `${userName} left the chat`;
      case "name_change":
        return `${userName} changed their name to ${newName}`;
      case "photo_change":
        return `${userName} changed their profile photo`;
      case "admin_change":
        return `${userName} ${isAdmin ? "is now an admin" : "is no longer an admin"}`;
      default:
        return message.message;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: theme.colors.greyLight,
          },
        ]}
      >
        <ThemeText
          style={[
            styles.message,
            {
              color: theme.colors.grey,
            },
          ]}
        >
          {getMessageContent()}
        </ThemeText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
  },
  messageContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  message: {
    fontSize: 12,
    textAlign: "center",
  },
});
