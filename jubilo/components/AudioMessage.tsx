import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface AudioMessageProps {
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
        duration: number;
      };
    }>;
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
}

export const AudioMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
}: AudioMessageProps) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!message.media?.[0]) return null;

  const media = message.media[0];
  const duration = media.metadata?.duration || 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePress = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playback
  };

  return (
    <MessageBubble
      message={message}
      isOwnMessage={isOwnMessage}
      onLongPress={onLongPress}
      onPress={handlePress}
    >
      <View style={styles.container}>
        <Pressable
          onPress={handlePress}
          style={[
            styles.playButton,
            {
              backgroundColor: isOwnMessage
                ? theme.colors.background
                : theme.colors.primary,
            },
          ]}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={
              isOwnMessage ? theme.colors.primary : theme.colors.background
            }
          />
        </Pressable>
        <View style={styles.waveform}>
          {/* TODO: Implement actual waveform visualization */}
          <View
            style={[
              styles.waveformBar,
              {
                backgroundColor: isOwnMessage
                  ? theme.colors.background
                  : theme.colors.primary,
                opacity: 0.3,
              },
            ]}
          />
          <View
            style={[
              styles.waveformBar,
              {
                backgroundColor: isOwnMessage
                  ? theme.colors.background
                  : theme.colors.primary,
                opacity: 0.5,
              },
            ]}
          />
          <View
            style={[
              styles.waveformBar,
              {
                backgroundColor: isOwnMessage
                  ? theme.colors.background
                  : theme.colors.primary,
                opacity: 0.7,
              },
            ]}
          />
        </View>
        <ThemeText
          style={[
            styles.duration,
            {
              color: isOwnMessage ? theme.colors.background : undefined,
            },
          ]}
        >
          {formatDuration(duration)}
        </ThemeText>
      </View>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 200,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  waveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    gap: 4,
  },
  waveformBar: {
    flex: 1,
    height: "100%",
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    marginLeft: 8,
  },
});
