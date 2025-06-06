import { supabase } from "@/lib/supabase";
import { getSignedUrl } from "@/services/chatService";
import { acceptEventInvitation } from "@/services/events";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {
  Avatar,
  Bubble,
  Composer,
  InputToolbar,
  Send,
  SystemMessage,
} from "react-native-gifted-chat";
import InvitationCard from "./InvitationCard";

// Generate 25 distinct colors for group chat members
const generateGroupColors = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#2ECC71",
    "#E74C3C",
    "#1ABC9C",
    "#F1C40F",
    "#34495E",
    "#16A085",
    "#D35400",
    "#2980B9",
    "#8E44AD",
    "#27AE60",
    "#C0392B",
    "#F39C12",
    "#7F8C8D",
    "#BDC3C7",
    "#2C3E50",
    "#95A5A6",
  ];
  return colors;
};

const GROUP_COLORS = generateGroupColors();

export const CustomBubble = (props) => {
  const { theme, currentMessage, currentUserId } = props;
  // Determine if this is a media message
  const isMedia = ["image", "video"].includes(currentMessage.type);
  return (
    <Bubble
      {...props}
      renderCustomView={(bubbleProps) => (
        <CustomMessageContent
          {...bubbleProps}
          theme={theme}
          currentUserId={currentUserId}
        />
      )}
      renderUsernameOnMessage={false}
      wrapperStyle={{
        left:
          currentMessage.type === "invitation"
            ? { backgroundColor: "transparent", padding: 0, marginLeft: 0 }
            : isMedia
            ? {
                backgroundColor: "transparent",
                borderRadius: 0,
                padding: 0,
                marginLeft: 0,
              }
            : {
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 16,
                padding: 8,
                marginLeft: 0,
              },
        right:
          currentMessage.type === "invitation"
            ? { backgroundColor: "transparent", padding: 0 }
            : isMedia
            ? { backgroundColor: "transparent", borderRadius: 0, padding: 0 }
            : {
                backgroundColor: theme.colors.primary,
                borderRadius: 16,
                padding: 8,
              },
      }}
      textStyle={{
        left: { color: theme.colors.text },
        right: { color: "white" },
      }}
      renderTime={() => null}
      renderMessageText={() => null}
    />
  );
};

export const CustomAvatar = (props) => {
  return (
    <Avatar
      {...props}
      containerStyle={{
        left: { marginRight: 0 },
        right: { marginLeft: 0 },
      }}
      imageStyle={{
        width: 32,
        height: 32,
        borderRadius: 16,
      }}
    />
  );
};

export const CustomInputToolbar = (props) => {
  const { theme, text, onPressAttachment, onPressMedia, onPressVoice } = props;
  const hasText = !!text && text.trim().length > 0;

  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: theme.colors.cardBackground,
        borderTopWidth: 0,
        borderRadius: 100,
        marginHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 0,
        marginTop: 4,
      }}
      primaryStyle={{
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
      }}
    >
      {/* Text Input */}
      <Composer {...props} theme={theme} />
      {/* Buttons on the right */}
      <AttachmentButton onPress={onPressAttachment} theme={theme} />
      {!hasText && (
        <>
          <MediaPickerButton onPress={onPressMedia} theme={theme} />
          <VoiceNoteButton onPress={onPressVoice} theme={theme} />
        </>
      )}
    </InputToolbar>
  );
};

export const CustomComposer = (props) => {
  const { theme } = props;
  return (
    <Composer
      {...props}
      textInputStyle={{
        color: theme.colors.text,
        fontSize: 16,
      }}
      placeholderTextColor={theme.colors.grey}
    />
  );
};

export const CustomSend = (props) => {
  const { theme } = props;
  return (
    <Send
      {...props}
      containerStyle={{
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.primary,
          width: 32,
          height: 32,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="send" size={16} color="white" />
      </View>
    </Send>
  );
};

export const AttachmentButton = ({ onPress, theme }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 28,
        height: 28,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
      }}
    >
      <Ionicons name="add" size={20} color={"white"} />
    </TouchableOpacity>
  );
};

export function TypingIndicator({ typingUsers = [], theme, currentUserId }) {
  // Filter out the current user
  const othersTyping = typingUsers.filter((u) => u.user_id !== currentUserId);
  if (!othersTyping.length) return null;
  // Compose names
  const names = othersTyping
    .map(
      (u) =>
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        "Unknown"
    )
    .join(", ");
  return (
    <View
      style={{
        backgroundColor: theme.colors.greyLight,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        minHeight: 24,
        minWidth: 60,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 4,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 14 }}>
        {names} {othersTyping.length === 1 ? "is" : "are"} typing...
      </Text>
    </View>
  );
}

export const getGroupMemberColor = (userId) => {
  // Use the user's ID to consistently assign a color
  const index =
    userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    GROUP_COLORS.length;
  return GROUP_COLORS[index];
};

export const MediaPickerButton = ({ onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
    <Ionicons name="image" size={24} color={theme.colors.text} />
  </TouchableOpacity>
);

export const VoiceNoteButton = ({ onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
    <Ionicons name="mic" size={24} color={theme.colors.text} />
  </TouchableOpacity>
);

export const CustomSystemMessage = (props) => (
  <SystemMessage
    {...props}
    containerStyle={{ backgroundColor: "pink" }}
    wrapperStyle={{ borderWidth: 10, borderColor: "white" }}
    textStyle={{ color: "crimson", fontWeight: "900" }}
  />
);

function CustomMessageContent({ currentMessage, theme, currentUserId }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Always call the hook, but only use it for video
  const videoPlayer = useVideoPlayer(signedUrl, (player) => {
    if (currentMessage.type === "video") {
      player.loop = true;
    }
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchUrl() {
      if (
        ["image", "video", "audio", "document"].includes(currentMessage.type) &&
        currentMessage.text &&
        !currentMessage.text.startsWith("http")
      ) {
        setLoading(true);
        const { success, url } = await getSignedUrl(currentMessage.text);

        if (isMounted) {
          setSignedUrl(success ? url : null);
          setLoading(false);
        }
      } else {
        setSignedUrl(currentMessage.text);
      }
    }
    fetchUrl();
    return () => {
      isMounted = false;
    };
  }, [currentMessage.text, currentMessage.type]);

  // Calculate image dimensions with better defaults and constraints
  let width = 200; // Default width
  let height = 200; // Default height
  const MAX_WIDTH = 300; // Maximum width
  const MIN_WIDTH = 100; // Minimum width
  const ASPECT_RATIO = 1; // Default aspect ratio

  if (currentMessage.metadata) {
    // Try to get dimensions from metadata
    if (currentMessage.metadata.width && currentMessage.metadata.height) {
      const originalWidth = currentMessage.metadata.width;
      const originalHeight = currentMessage.metadata.height;
      const aspectRatio = originalWidth / originalHeight;

      // Calculate width while maintaining aspect ratio
      width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, originalWidth / 6));
      height = width / aspectRatio;
    } else if (
      currentMessage.metadata.thumbnailWidth &&
      currentMessage.metadata.thumbnailHeight
    ) {
      const thumbWidth = currentMessage.metadata.thumbnailWidth;
      const thumbHeight = currentMessage.metadata.thumbnailHeight;
      const aspectRatio = thumbWidth / thumbHeight;

      width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, thumbWidth / 2));
      height = width / aspectRatio;
    }
  }

  if (loading) {
    return (
      <Text style={{ color: theme?.colors?.text || "#333" }}>Loading...</Text>
    );
  }

  // Handle attachments
  if (currentMessage.type === "image" && signedUrl) {
    return (
      <View style={{ alignItems: "flex-end" }}>
        <Image
          source={{ uri: signedUrl }}
          style={{
            width,
            height,
            borderWidth: 1,
            borderColor: theme?.colors?.primary,
            borderRadius: 6,
          }}
          resizeMode="cover"
        />
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.grey,
            marginTop: 2,
            alignSelf:
              currentMessage.user && currentUserId === currentMessage.user._id
                ? "flex-end"
                : "flex-start",
          }}
        >
          {new Date(currentMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  }
  if (currentMessage.type === "video" && signedUrl) {
    return (
      <View style={{ alignItems: "flex-end" }}>
        <VideoView
          player={videoPlayer}
          style={{
            width,
            height,
            borderWidth: 1,
            borderColor: theme?.colors?.primary,
            borderRadius: 6,
          }}
          allowsFullscreen
          allowsPictureInPicture
        />
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.grey,
            marginTop: 2,
            alignSelf:
              currentMessage.user && currentUserId === currentMessage.user._id
                ? "flex-end"
                : "flex-start",
          }}
        >
          {new Date(currentMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  }

  // Audio, document, and text messages remain unchanged
  if (currentMessage.type === "audio" && signedUrl) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 4,
        }}
        onPress={() => Linking.openURL(signedUrl)}
      >
        <Ionicons
          name="play-circle"
          size={32}
          color={theme?.colors?.primary || "#007AFF"}
        />
        <Text style={{ marginLeft: 8, color: theme?.colors?.text || "#333" }}>
          Play audio
        </Text>
      </TouchableOpacity>
    );
  }
  if (currentMessage.type === "document" && signedUrl) {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: 4,
        }}
        onPress={() => Linking.openURL(signedUrl)}
      >
        <Ionicons
          name="document"
          size={28}
          color={theme?.colors?.primary || "#007AFF"}
        />
        <Text style={{ marginLeft: 8, color: theme?.colors?.text || "#333" }}>
          {currentMessage.metadata?.fileName || "Document"}
        </Text>
      </TouchableOpacity>
    );
  }

  // Invitation messages
  if (currentMessage.type === "invitation") {
    let eventData;
    try {
      eventData = JSON.parse(currentMessage.text || currentMessage.content);
    } catch (e) {
      return <Text style={{ color: "red" }}>Invalid invitation data</Text>;
    }
    return (
      <View style={{ alignItems: "flex-end", marginBottom: 0, padding: 0 }}>
        <InvitationCard
          event={eventData}
          status={eventData.status || "pending"}
          currentUserId={currentUserId}
          onAccept={() => handleAccept(eventData.invitation_id)}
          onDecline={() => handleDecline(eventData.invitation_id)}
        />
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.grey,
            marginTop: 2,
            alignSelf:
              currentMessage.user && currentUserId === currentMessage.user._id
                ? "flex-end"
                : "flex-start",
          }}
        >
          {new Date(currentMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  }

  // Text messages (with timestamp inside bubble)
  if (currentMessage.text) {
    return (
      <>
        <Text
          style={{
            color: theme?.colors?.text || "#fff",
            fontSize: 16,
          }}
        >
          {currentMessage.text}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: theme.colors.grey,
            marginTop: 4,
            alignSelf:
              currentMessage.user && currentUserId === currentMessage.user._id
                ? "flex-end"
                : "flex-start",
          }}
        >
          {new Date(currentMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </>
    );
  }

  return null;
}

async function handleAccept(invitationId) {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    // Use the consolidated function from events.js
    const { data, error } = await acceptEventInvitation(invitationId, user.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { success: false, error: error.message };
  }
}

async function handleDecline(invitationId) {
  try {
    const { error } = await supabase
      .from("event_invitations")
      .update({ status: "rejected" })
      .eq("id", invitationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error declining invitation:", error);
    return { success: false, error: error.message };
  }
}
