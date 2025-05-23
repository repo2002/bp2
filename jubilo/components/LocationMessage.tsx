import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { MessageBubble } from "./MessageBubble";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import ThemeText from "./ThemeText";
import { Id } from "@/convex/_generated/dataModel";

interface LocationMessageProps {
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
    metadata?: {
      latitude: number;
      longitude: number;
      name?: string;
    };
  };
  isOwnMessage: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
}

export const LocationMessage = ({
  message,
  isOwnMessage,
  onLongPress,
  onPress,
}: LocationMessageProps) => {
  const theme = useTheme();

  if (!message.metadata?.latitude || !message.metadata?.longitude) return null;

  const { latitude, longitude, name } = message.metadata;
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x150&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`;

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
        <Image source={{ uri: mapUrl }} style={styles.map} resizeMode="cover" />
        <View style={styles.infoContainer}>
          <View style={styles.locationIcon}>
            <Ionicons
              name="location"
              size={20}
              color={isOwnMessage ? theme.colors.primary : theme.colors.grey}
            />
          </View>
          <View style={styles.textContainer}>
            <ThemeText
              style={[
                styles.locationName,
                {
                  color: isOwnMessage ? theme.colors.primary : undefined,
                },
              ]}
              numberOfLines={1}
            >
              {name || "Shared Location"}
            </ThemeText>
            <ThemeText
              style={[
                styles.coordinates,
                {
                  color: isOwnMessage
                    ? theme.colors.primary
                    : theme.colors.grey,
                },
              ]}
            >
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </ThemeText>
          </View>
        </View>
      </Pressable>
    </MessageBubble>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: 150,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  coordinates: {
    fontSize: 12,
  },
});
