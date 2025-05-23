import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Id } from "@/convex/_generated/dataModel";

interface MediaMessageProps {
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
      metadata?: any;
    }>;
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_WIDTH = SCREEN_WIDTH * 0.6;
const MAX_HEIGHT = 200;

export const MediaMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
}: MediaMessageProps) => {
  const theme = useTheme();

  if (!message.media?.[0]) return null;

  const media = message.media[0];
  const isVideo = media.type.startsWith("video");
  const isImage = media.type.startsWith("image");

  return (
    <MessageBubble
      message={message}
      isOwnMessage={isOwnMessage}
      onLongPress={onLongPress}
      onPress={onPress}
    >
      <View style={styles.mediaContainer}>
        {isImage && (
          <Image
            source={{ uri: media.storageId }}
            style={styles.media}
            resizeMode="cover"
          />
        )}
        {isVideo && (
          <View style={styles.videoContainer}>
            <Image
              source={{ uri: media.metadata?.thumbnail || media.storageId }}
              style={styles.media}
              resizeMode="cover"
            />
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color={theme.colors.background} />
            </View>
          </View>
        )}
      </View>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  mediaContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  media: {
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    borderRadius: 12,
  },
  videoContainer: {
    position: "relative",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
