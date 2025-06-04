import { AttachmentOverlay } from "@/components/chats/AttachmentOverlay";
import {
  AttachmentButton,
  CustomAvatar,
  CustomBubble,
  CustomComposer,
  CustomInputToolbar,
  CustomSend,
  getGroupMemberColor,
  MediaPickerButton,
  TypingIndicator,
  VoiceNoteButton,
} from "@/components/chats/ChatComponents";
import { useTheme } from "@/hooks/theme";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { chatMessages, chatRooms, users } from "./dummyData";

const CURRENT_USER_ID = "user-1-uuid";

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [inputText, setInputText] = useState("");

  // Get params safely
  const params = useLocalSearchParams();

  // Update roomId when params are available
  useEffect(() => {
    if (params?.id) {
      setRoomId(params.id);
    }
  }, [params?.id]);

  // Find the room
  const room = useMemo(() => {
    if (!roomId) return null;
    return chatRooms.find((r) => r.id === roomId);
  }, [roomId]);

  // Get messages for this room, newest first
  const messages = useMemo(() => {
    if (!roomId) return [];
    return chatMessages
      .filter((msg) => msg.room_id === roomId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((msg) => {
        const sender = users.find((u) => u.id === msg.sender_id);
        const replyTo = msg.reply_to
          ? chatMessages.find((m) => m.id === msg.reply_to)
          : null;
        const replyToSender = replyTo
          ? users.find((u) => u.id === replyTo.sender_id)
          : null;

        return {
          _id: msg.id,
          text: msg.content,
          createdAt: new Date(msg.created_at),
          user: {
            _id: sender.id,
            name: sender.first_name + " " + sender.last_name,
            avatar: sender.avatar,
          },
          reply_to: replyTo
            ? {
                _id: replyTo.id,
                text: replyTo.content,
                user: {
                  _id: replyToSender.id,
                  name:
                    replyToSender.first_name + " " + replyToSender.last_name,
                },
              }
            : null,
          metadata: msg.metadata,
        };
      });
  }, [roomId]);

  const [chatMsgs, setChatMsgs] = useState(messages);

  // Update loading state when room is found
  useEffect(() => {
    if (room) {
      setIsLoading(false);
    }
  }, [room]);

  useEffect(() => {
    setChatMsgs(messages);
  }, [messages]);

  const onSend = useCallback((newMessages = []) => {
    setChatMsgs((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  }, []);

  const handleAttachment = useCallback((type) => {
    // TODO: Handle different attachment types
    console.log("Attachment type:", type);
  }, []);

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
      <GiftedChat
        messages={chatMsgs}
        onSend={onSend}
        user={{ _id: CURRENT_USER_ID }}
        text={inputText}
        onInputTextChanged={setInputText}
        renderBubble={(props) => <CustomBubble {...props} theme={theme} />}
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
          <TypingIndicator typingUsers={typingUsers} theme={theme} />
        )}
        scrollToBottom
        renderUsernameOnMessage={room.is_group}
        renderMessageText={(props) => {
          const { currentMessage } = props;
          const color = room.is_group
            ? getGroupMemberColor(currentMessage.user._id)
            : theme.colors.text;
          return (
            <View>
              {room.is_group && (
                <Text
                  style={{
                    color,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  {currentMessage.user.name}
                </Text>
              )}
              <Text
                style={{
                  color:
                    currentMessage.user._id === CURRENT_USER_ID
                      ? "white"
                      : theme.colors.text,
                }}
              >
                {currentMessage.text}
              </Text>
            </View>
          );
        }}
        listViewProps={{
          onEndReached: () => {
            // TODO: Load earlier messages
          },
          onEndReachedThreshold: 0.5,
        }}
      />
      <AttachmentOverlay
        visible={isAttachmentVisible}
        onClose={() => setIsAttachmentVisible(false)}
        onSelect={handleAttachment}
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
