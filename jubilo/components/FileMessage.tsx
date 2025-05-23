import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface FileMessageProps {
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
    media?: Array<{
      storageId: string;
      type: string;
      metadata?: {
        fileName: string;
        fileSize: number;
      };
    }>;
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
}

export const FileMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
}: FileMessageProps) => {
  const theme = useTheme();

  if (!message.media?.[0]) return null;

  const media = message.media[0];
  const { fileName, fileSize } = media.metadata || {};

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "document-text";
    if (type.includes("image")) return "image";
    if (type.includes("video")) return "videocam";
    if (type.includes("audio")) return "musical-notes";
    if (type.includes("word")) return "document-text";
    if (type.includes("excel") || type.includes("sheet")) return "grid";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "easel";
    if (type.includes("zip") || type.includes("archive")) return "archive";
    return "document";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <MessageBubble
      message={message}
      isOwnMessage={isOwnMessage}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <Pressable
        style={[
          styles.container,
          {
            backgroundColor: isOwnMessage
              ? theme.colors.background
              : theme.colors.greyLight,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isOwnMessage
                ? theme.colors.primary
                : theme.colors.primary,
            },
          ]}
        >
          <Ionicons
            name={getFileIcon(media.type)}
            size={24}
            color={theme.colors.background}
          />
        </View>
        <View style={styles.infoContainer}>
          <ThemeText
            style={[
              styles.fileName,
              {
                color: isOwnMessage ? theme.colors.primary : undefined,
              },
            ]}
            numberOfLines={1}
          >
            {fileName || "File"}
          </ThemeText>
          <ThemeText
            style={[
              styles.fileSize,
              {
                color: isOwnMessage ? theme.colors.primary : theme.colors.grey,
              },
            ]}
          >
            {formatFileSize(fileSize || 0)}
          </ThemeText>
        </View>
        <Ionicons
          name="download"
          size={20}
          color={isOwnMessage ? theme.colors.primary : theme.colors.grey}
        />
      </Pressable>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    minWidth: 200,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
  },
});
