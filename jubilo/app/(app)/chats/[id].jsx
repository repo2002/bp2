import defaultAvatar from "@/assets/images/default-avatar.png";
import AttachmentHandler from "@/components/chats/AttachmentHandler";
import {
  AttachmentButton,
  CustomAvatar,
  CustomBubble,
  CustomComposer,
  CustomInputToolbar,
  CustomSend,
  MediaPickerButton,
  VoiceNoteButton,
} from "@/components/chats/ChatComponents";
import ChatHeader from "@/components/chats/ChatHeader";
import MessageList from "@/components/chats/MessageList";
import MessageRenderer from "@/components/chats/MessageRenderer";
import TypingIndicatorHandler from "@/components/chats/TypingIndicatorHandler";
import { useAuth } from "@/contexts/AuthContext";
import useChatRoom from "@/hooks/chat/useChatRoom";
import useSendMessage from "@/hooks/chat/useSendMessage";
import useTypingStatus from "@/hooks/chat/useTypingStatus";
import { useTheme } from "@/hooks/theme";
import { markMessagesAsRead } from "@/services/chatService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const router = useRouter();

  // Get params safely
  const params = useLocalSearchParams();
  const roomId = params?.id;

  // Use the chat room hook
  const { room, messages, unread, isLoading } = useChatRoom(roomId, user.id);

  // Use the typing status hook
  const { handleTyping } = useTypingStatus(roomId, user.id);

  // Mark messages as read when viewing the chat
  useEffect(() => {
    if (roomId && user?.id) {
      markMessagesAsRead(roomId, user.id);
    }
  }, [roomId, user?.id]);

  // Use the send message hook
  const { sendMessage } = useSendMessage(roomId, user.id);

  // Helper to get chat title and avatar
  let chatTitle = "Chat";
  let chatAvatar = defaultAvatar;
  if (room) {
    if (room.is_group) {
      chatTitle = room.name || "Group";
      chatAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        room.name || "Group"
      )}`;
    } else if (Array.isArray(room.participants) && user?.id) {
      const other = room.participants.find(
        (p) => p.user && p.user.id !== user.id
      );
      if (other && other.user) {
        const { first_name, last_name, username, image_url } = other.user;
        chatTitle =
          [first_name, last_name].filter(Boolean).join(" ") ||
          username ||
          "Chat";
        chatAvatar = image_url || defaultAvatar;
      }
    }
  }

  // Handler for avatar press
  const handleAvatarPress = () => {
    if (room?.is_group) {
      router.push(`/chats/${roomId}/group-details`);
    } else {
      router.push(`/chats/${roomId}/chat-details`);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!room) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text style={{ color: theme.colors.text }}>Room not found</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: 8,
      }}
    >
      <ChatHeader
        chatTitle={chatTitle}
        chatAvatar={chatAvatar}
        onBack={() => router.back()}
        onAvatarPress={handleAvatarPress}
        insets={insets}
        theme={theme}
      />
      <MessageRenderer messages={messages} unread={unread} theme={theme} />
      <MessageList
        messages={messages}
        onSend={sendMessage}
        user={{ _id: user.id }}
        text={inputText}
        onInputTextChanged={(text) => {
          setInputText(text);
          handleTyping(text.length > 0);
        }}
        renderBubble={(props) => (
          <CustomBubble {...props} theme={theme} currentUserId={user.id} />
        )}
        renderAvatar={(props) => <CustomAvatar {...props} theme={theme} />}
        renderInputToolbar={(props) => (
          <CustomInputToolbar
            {...props}
            theme={theme}
            text={inputText}
            onPressAttachment={() => setIsAttachmentVisible(true)}
            onPressMedia={() => {
              /* open media picker */
            }}
            onPressVoice={() => {
              /* start voice note */
            }}
          />
        )}
        renderComposer={(props) => <CustomComposer {...props} theme={theme} />}
        renderSend={(props) => <CustomSend {...props} theme={theme} />}
        renderActions={(props) => (
          <>
            <AttachmentButton
              onPress={() => setIsAttachmentVisible(true)}
              theme={theme}
            />
            {!inputText && (
              <>
                <MediaPickerButton onPress={() => {}} theme={theme} />
                <VoiceNoteButton onPress={() => {}} theme={theme} />
              </>
            )}
          </>
        )}
        renderFooter={() => (
          <TypingIndicatorHandler
            roomId={roomId}
            userId={user.id}
            onTypingUsersChange={() => {}}
          />
        )}
        scrollToBottom
        renderUsernameOnMessage={room.is_group}
        listViewProps={{
          onEndReached: () => {
            // TODO: Load earlier messages
          },
          onEndReachedThreshold: 0.5,
        }}
      />
      <AttachmentHandler
        roomId={roomId}
        userId={user.id}
        onAttachmentSent={() => setIsAttachmentVisible(false)}
        onError={(error) => alert(error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
