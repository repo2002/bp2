import defaultAvatar from "@/assets/images/default-avatar.png";
import AttachmentHandler from "@/components/chats/AttachmentHandler";
import { AttachmentOverlay } from "@/components/chats/AttachmentOverlay";
import CustomBubble from "@/components/chats/bubbles/CustomBubble";
// import CustomAvatar from "@/components/chats/ChatComponents";
import ChatHeader from "@/components/chats/ChatHeader";
import ChecklistModal from "@/components/chats/CheckListModal";
import AttachmentButton from "@/components/chats/input/AttachmentButton";
import CameraButton from "@/components/chats/input/CameraButton";
import CustomComposer from "@/components/chats/input/CustomComposer";
import CustomInputToolbar from "@/components/chats/input/CustomInputToolbar";
import CustomSend from "@/components/chats/input/CustomSend";
import MessageList from "@/components/chats/MessageList";
import MessageRenderer from "@/components/chats/MessageRenderer";
import TypingIndicatorHandler from "@/components/chats/TypingIndicatorHandler";
import { useAuth } from "@/contexts/AuthContext";
import useChatRoom from "@/hooks/chat/useChatRoom";
import useSendMessage from "@/hooks/chat/useSendMessage";
import useTypingStatus from "@/hooks/chat/useTypingStatus";
import { useTheme } from "@/hooks/theme";
import { markMessagesAsRead, sendChecklist } from "@/services/chatService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const router = useRouter();
  const attachmentHandlerRef = useRef(null);
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);

  // Get params safely
  const params = useLocalSearchParams();
  const roomId = params?.id;

  // Use the chat room hook
  const {
    room,
    messages,
    unread,
    isLoading,
    loadOlderMessages,
    hasMore,
    loadingEarlier,
  } = useChatRoom(roomId, user.id);

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

  const handleAttachment = (type) => {
    if (attachmentHandlerRef.current) {
      attachmentHandlerRef.current.handleAttachment(type);
    }
  };

  // const {
  //   isRecording,
  //   audioUri,
  //   error: recordingError,
  //   startRecording,
  //   stopRecording,
  //   reset: resetRecording,
  // } = useVoiceRecorder();

  // const handleVoiceNote = async () => {
  //   if (!isRecording) {
  //     await startRecording();
  //   } else {
  //     const uri = await stopRecording();
  //     if (uri) {
  //       try {
  //         await sendAttachment(
  //           roomId,
  //           user.id,
  //           {
  //             uri,
  //             type: "audio/m4a", // or the correct MIME type
  //             name: `voice_${Date.now()}.m4a`,
  //           },
  //           "audio"
  //         );
  //         resetRecording();
  //       } catch (err) {
  //         alert("Failed to send audio: " + err.message);
  //       }
  //     }
  //   }
  // };

  if (isLoading) {
    return (
      <View style={styles.centered}>
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
            onPressCamera={() => handleAttachment("camera")}
            //onPressVoice={handleVoiceNote}
            //isRecording={isRecording}
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
                <CameraButton
                  onPress={() => {
                    handleAttachment("camera");
                  }}
                  theme={theme}
                />
                {/* <VoiceNoteButton
                  onPress={() => {
                    handleVoiceNote();
                  }}
                  theme={theme}
                /> */}
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
        loadEarlier={hasMore}
        onLoadEarlier={loadOlderMessages}
        isLoadingEarlier={loadingEarlier}
      />
      <AttachmentHandler
        ref={attachmentHandlerRef}
        roomId={roomId}
        userId={user.id}
        onAttachmentSent={() => setIsAttachmentVisible(false)}
        onError={(error) => alert(error)}
      />
      <AttachmentOverlay
        visible={isAttachmentVisible}
        onClose={() => setIsAttachmentVisible(false)}
        onSelect={(type) => {
          if (type === "checklist") setChecklistModalVisible(true);
          else handleAttachment(type);
        }}
      />
      {/* {isRecording && (
        <View
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: theme.colors.error,
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Recording...
          </Text>
        </View>
      )} */}
      <ChecklistModal
        visible={checklistModalVisible}
        onClose={() => setChecklistModalVisible(false)}
        onSend={async (title, items) => {
          await sendChecklist(roomId, user.id, title, items);
          setChecklistModalVisible(false);
        }}
        theme={theme}
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
