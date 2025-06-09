import { supabase } from "@/lib/supabase";
import { getSignedUrl } from "@/services/chatService";
import { acceptEventInvitation } from "@/services/events";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Image, Keyboard, Text, TouchableOpacity, View } from "react-native";
import {
  Bubble,
  Composer,
  InputToolbar,
  Send,
  SystemMessage,
} from "react-native-gifted-chat";

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
  const isCurrentUser = currentMessage.user._id === currentUserId;

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
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 8,
                marginLeft: 4,
                marginBottom: 4,
              },
        right:
          currentMessage.type === "invitation"
            ? { backgroundColor: "transparent", padding: 0 }
            : isMedia
            ? { backgroundColor: "transparent", borderRadius: 0, padding: 0 }
            : {
                backgroundColor: theme.colors.primary,
                borderRadius: 9,
                padding: 8,
                marginBottom: 4,
                marginRight: 4,
              },
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
  const { theme, text, onPressAttachment, onPressCamera, onPressVoice } = props;
  const hasText = !!text && text.trim().length > 0;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: theme.colors.cardBackground,
        borderTopWidth: 0,
        paddingHorizontal: keyboardVisible ? 0 : 12,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingBottom: keyboardVisible ? 8 : 12,
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
          <CameraButton onPress={onPressCamera} theme={theme} />
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
      textInputProps={{
        multiline: true,
        maxLength: 1000,
        placeholderTextColor: theme.colors.grey,
        autoFocus: false,
        style: {
          flex: 1,
          padding: 8,
        },
      }}
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

export const CameraButton = ({ onPress, theme }) => (
  <TouchableOpacity onPress={onPress} style={{ marginHorizontal: 4 }}>
    <Ionicons name="camera" size={24} color={theme.colors.text} />
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

// Message Container Component
const MessageContainer = ({ isCurrentUser, theme, children }) => (
  <View
    style={{
      backgroundColor: isCurrentUser
        ? theme.colors.primary
        : theme.colors.cardBackground,
      borderRadius: 10,
    }}
  >
    {children}
  </View>
);

// Sender Name Component
const SenderName = ({ currentMessage, isCurrentUser, theme }) => {
  if (isCurrentUser) return null;
  return (
    <Text
      style={{
        color: currentMessage.isGroup
          ? getGroupMemberColor(currentMessage.user._id)
          : theme.colors.grey,
        fontSize: 14,
        marginBottom: 4,

        fontWeight: "700",
        alignSelf: "flex-start",
      }}
    >
      {currentMessage.user.name}
    </Text>
  );
};

// Message Timestamp Component
const MessageTimestamp = ({ currentMessage, isCurrentUser, theme, style }) => (
  <Text
    style={{
      fontSize: 10,
      color: isCurrentUser ? "#FFFFFF" : theme.colors.text,
      marginTop: 2,
      marginLeft: 32,
      alignSelf: "flex-end",
      padding: 4,
    }}
  >
    {new Date(currentMessage.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </Text>
);

// Media Container Component
const MediaContainer = ({ isCurrentUser, width, height, children }) => (
  <View
    style={{
      width,
      height,
      borderTopLeftRadius: isCurrentUser ? 10 : 0,
      borderTopRightRadius: isCurrentUser ? 10 : 0,
    }}
  >
    {children}
  </View>
);

function CustomMessageContent({ currentMessage, theme, currentUserId }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCurrentUser = currentMessage.user._id === currentUserId;

  // Always call the hook, but only use it for video
  const videoPlayer = useVideoPlayer(signedUrl, (player) => {
    if (currentMessage.type === "video") {
      player.loop = false;
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
      <MessageContainer isCurrentUser={isCurrentUser} theme={theme}>
        <SenderName
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
        <MediaContainer
          isCurrentUser={isCurrentUser}
          width={width}
          height={height}
        >
          <Image
            source={{ uri: signedUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </MediaContainer>
        <MessageTimestamp
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
      </MessageContainer>
    );
  }

  if (currentMessage.type === "video" && signedUrl) {
    return (
      <MessageContainer isCurrentUser={isCurrentUser} theme={theme}>
        <SenderName
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
        <MediaContainer
          isCurrentUser={isCurrentUser}
          width={width}
          height={height}
        >
          <VideoView
            player={videoPlayer}
            style={{ width: "100%", height: "100%" }}
            allowsFullscreen
            allowsPictureInPicture
          />
        </MediaContainer>
        <MessageTimestamp
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
      </MessageContainer>
    );
  }

  if (currentMessage.type === "audio" && signedUrl) {
    return (
      <MessageContainer isCurrentUser={isCurrentUser} theme={theme}>
        <SenderName
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 4,
            padding: 8,
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
        <MessageTimestamp
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
      </MessageContainer>
    );
  }

  if (currentMessage.type === "document" && signedUrl) {
    return (
      <MessageContainer isCurrentUser={isCurrentUser} theme={theme}>
        <SenderName
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 4,
            padding: 8,
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
        <MessageTimestamp
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
      </MessageContainer>
    );
  }

  // Text messages
  if (currentMessage.text) {
    return (
      <MessageContainer isCurrentUser={isCurrentUser} theme={theme}>
        <SenderName
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
        <Text
          style={{
            color: isCurrentUser ? "#FFFFFF" : theme.colors.text,
            fontSize: 16,
            alignItems: "flex-start",
          }}
        >
          {currentMessage.text}
        </Text>
        <MessageTimestamp
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
      </MessageContainer>
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
