import CheckListCard from "@/components/chats/CheckListCard";
import InvitationCard from "@/components/chats/InvitationCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  getChecklistForMessage,
  getSignedUrl,
  toggleChecklistItemShared,
} from "@/services/chatService";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Image, Text } from "react-native";
import { handleAccept, handleDecline } from "./InvitationHandlers";
import MediaContainer from "./MediaContainer";
import MessageContainer from "./MessageContainer";
import MessageTimestamp from "./MessageTimestamp";
import SenderName from "./SenderName";

function CustomMessageContent({ currentMessage, theme, currentUserId }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checklistData, setChecklistData] = useState(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const isCurrentUser = currentMessage.user._id === currentUserId;
  const { user } = useAuth();

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
        ["image", "video", "checklist"].includes(currentMessage.type) &&
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

  useEffect(() => {
    async function fetchChecklist() {
      if (
        currentMessage.type === "checklist" &&
        (currentMessage._id || currentMessage.id)
      ) {
        setChecklistLoading(true);
        const data = await getChecklistForMessage(
          currentMessage._id || currentMessage.id
        );
        setChecklistData(data);
        setChecklistLoading(false);
      }
    }
    fetchChecklist();
  }, [currentMessage]);

  const handleToggle = async (itemId, checked) => {
    await toggleChecklistItemShared(itemId, user.id, checked);
  };

  // Invitation message
  if (currentMessage.type === "invitation") {
    let eventData;
    try {
      eventData = JSON.parse(currentMessage.text || currentMessage.content);
    } catch (e) {
      return <Text style={{ color: "red" }}>Invalid invitation data</Text>;
    }
    if (!eventData) return null;
    return (
      <MessageContainer isCurrentUser={isCurrentUser} theme={theme}>
        <SenderName
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
        <InvitationCard
          event={eventData}
          status={eventData?.status || "pending"}
          onAccept={() =>
            handleAccept(
              eventData?.invitation_id,
              eventData?.eventId,
              eventData?.user_id
            )
          }
          onDecline={() => handleDecline(eventData?.invitation_id)}
        />
        <MessageTimestamp
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
      </MessageContainer>
    );
  }

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
            style={{
              width: "100%",
              height: "100%",
              borderTopLeftRadius: isCurrentUser ? 10 : 0,
              borderTopRightRadius: isCurrentUser ? 10 : 0,
            }}
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
            style={{
              width: "100%",
              height: "100%",
              borderTopLeftRadius: isCurrentUser ? 10 : 0,
              borderTopRightRadius: isCurrentUser ? 10 : 0,
            }}
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

  if (currentMessage.type === "checklist") {
    if (!checklistData) return null;
    return (
      <MessageContainer isCurrentUser={isCurrentUser} theme={theme}>
        <SenderName
          currentMessage={currentMessage}
          isCurrentUser={isCurrentUser}
          theme={theme}
        />
        <CheckListCard
          checklistData={checklistData}
          onToggle={handleToggle}
          theme={theme}
          isCurrentUser={isCurrentUser}
          currentMessage={currentMessage}
        />
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
            paddingHorizontal: 8,
            paddingTop: isCurrentUser ? 4 : 0,
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

export default CustomMessageContent;
