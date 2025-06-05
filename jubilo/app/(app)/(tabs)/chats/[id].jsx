import defaultAvatar from "@/assets/images/default-avatar.png";
import { AttachmentOverlay } from "@/components/chats/AttachmentOverlay";
import {
  AttachmentButton,
  CustomAvatar,
  CustomBubble,
  CustomComposer,
  CustomInputToolbar,
  CustomSend,
  MediaPickerButton,
  TypingIndicator,
  VoiceNoteButton,
} from "@/components/chats/ChatComponents";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import useMessagesSubscription from "@/hooks/useMessagesSubscription";
import useParticipantsSubscription from "@/hooks/useParticipantsSubscription";
import useTypingSubscription from "@/hooks/useTypingSubscription";
import {
  getChatById,
  getTypingUsers,
  markMessagesAsRead,
  sendAttachment,
  sendMessage,
  updateTypingStatus,
} from "@/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isAttachmentVisible, setIsAttachmentVisible] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const listRef = useRef();
  const router = useRouter();

  // Get params safely
  const params = useLocalSearchParams();

  // Update roomId when params are available
  useEffect(() => {
    if (params?.id) {
      setRoomId(params.id);
    }
  }, [params?.id]);

  // Named function for fetching room and messages (only used on initial load or navigation)
  const fetchRoomAndMessages = async () => {
    if (!roomId || !user?.id) return;
    try {
      setIsLoading(true);
      const { success, data, error } = await getChatById(roomId, user.id);

      if (success) {
        setRoom(data);
        setUnread(data.unread || 0);
        // Transform messages to GiftedChat format and sort newest first
        const transformedMessages = data.messages
          .map((msg) => ({
            _id: msg.id,
            text: msg.content,
            type: msg.type || "text",
            createdAt: new Date(msg.created_at),
            user: {
              _id: msg.sender.id,
              name:
                `${msg.sender.first_name} ${msg.sender.last_name}`.trim() ||
                msg.sender.username,
              avatar: msg.sender.image_url || defaultAvatar,
            },
            metadata: msg.metadata,
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // Newest first
        setMessages(transformedMessages);
      } else {
        console.error("Error fetching chat:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch room and messages on initial load or navigation
  useEffect(() => {
    fetchRoomAndMessages();
  }, [roomId, user?.id]);

  // Incrementally update messages on real-time events
  useMessagesSubscription(roomId, (payload) => {
    if (payload.eventType === "INSERT") {
      const msg = payload.new;
      setMessages((prev) => [
        {
          _id: msg.id,
          text: msg.content,
          type: msg.type || "text",
          createdAt: new Date(msg.created_at),
          user: {
            _id: msg.sender_id,
            name: msg.sender_name || "Unknown",
            avatar: msg.sender_image_url || defaultAvatar,
          },
          metadata: msg.metadata,
        },
        ...prev,
      ]);
    }
    // Optionally handle UPDATE and DELETE events here
  });

  // You can keep participant subscription as a refetch for now
  useParticipantsSubscription(roomId, fetchRoomAndMessages);

  // Mark messages as read when viewing the chat
  useEffect(() => {
    if (roomId && user?.id) {
      markMessagesAsRead(roomId, user.id).then(() => setUnread(0));
    }
  }, [roomId, user?.id]);

  const onSend = useCallback(
    async (newMessages = []) => {
      if (!user?.id || !roomId) return;

      try {
        const message = newMessages[0];
        const { success, error } = await sendMessage(
          roomId,
          user.id,
          message.text,
          "text",
          message.metadata
        );

        if (!success) {
          console.error("Error sending message:", error);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    },
    [roomId, user?.id]
  );

  const handleAttachment = useCallback(
    async (type) => {
      if (!user?.id || !roomId) return;
      try {
        let result;
        switch (type) {
          case "image": {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              alert(
                "Sorry, we need camera roll permissions to make this work!"
              );
              return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              const asset = result.assets[0];
              const { success, error } = await sendAttachment(
                roomId,
                user.id,
                {
                  uri: asset.uri,
                  type: asset.type || "image/jpeg",
                  name: asset.fileName || "image.jpg",
                  size: asset.fileSize,
                },
                "image"
              );
              if (!success) alert("Error sending image: " + error);
              else setIsAttachmentVisible(false);
            }
            break;
          }
          case "video": {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              alert(
                "Sorry, we need camera roll permissions to make this work!"
              );
              return;
            }
            result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              const asset = result.assets[0];
              const { success, error } = await sendAttachment(
                roomId,
                user.id,
                {
                  uri: asset.uri,
                  type: asset.type || "video/mp4",
                  name: asset.fileName || "video.mp4",
                  size: asset.fileSize,
                  duration: asset.duration,
                  thumbnail: asset.uri, // Optionally generate a thumbnail
                },
                "video"
              );
              if (!success) alert("Error sending video: " + error);
              else setIsAttachmentVisible(false);
            }
            break;
          }
          case "camera": {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              alert("Sorry, we need camera permissions to make this work!");
              return;
            }
            result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              const asset = result.assets[0];
              const fileType = asset.type?.startsWith("video")
                ? "video"
                : "image";
              const { success, error } = await sendAttachment(
                roomId,
                user.id,
                {
                  uri: asset.uri,
                  type:
                    asset.type ||
                    (fileType === "video" ? "video/mp4" : "image/jpeg"),
                  name:
                    asset.fileName ||
                    (fileType === "video" ? "video.mp4" : "image.jpg"),
                  size: asset.fileSize,
                  duration: asset.duration,
                  thumbnail: asset.uri,
                },
                fileType
              );
              if (!success) alert(`Error sending ${fileType}: ` + error);
              else setIsAttachmentVisible(false);
            }
            break;
          }
          case "audio": {
            // Request permission
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== "granted") {
              alert("Sorry, we need microphone permissions to make this work!");
              return;
            }
            // Record audio using expo-audio
            let recorder;
            try {
              recorder = new Audio.Recorder();
              await recorder.prepareToRecordAsync({
                android: {
                  extension: ".m4a",
                  outputFormat: "MPEG_4",
                  audioEncoder: "AAC",
                  sampleRate: 44100,
                  numberOfChannels: 2,
                  bitRate: 128000,
                },
                ios: {
                  extension: ".m4a",
                  audioQuality: "high",
                  sampleRate: 44100,
                  numberOfChannels: 2,
                  bitRate: 128000,
                },
              });
              await recorder.startAsync();
              alert("Recording... Press OK to stop.");
              await recorder.stopAndUnloadAsync();
              const uri = recorder.getURI();
              if (uri) {
                const { success, error } = await sendAttachment(
                  roomId,
                  user.id,
                  {
                    uri,
                    type: "audio/m4a",
                    name: "voice.m4a",
                  },
                  "audio"
                );
                if (!success) alert("Error sending audio: " + error);
                else setIsAttachmentVisible(false);
              }
            } catch (err) {
              alert("Error recording audio: " + err.message);
            }
            break;
          }
          case "document": {
            const result = await DocumentPicker.getDocumentAsync({
              type: "*/*",
              copyToCacheDirectory: true,
              multiple: false,
            });
            if (result.type === "success") {
              const { uri, mimeType, name, size } = result;
              const { success, error } = await sendAttachment(
                roomId,
                user.id,
                {
                  uri,
                  type: mimeType,
                  name,
                  size,
                },
                "document"
              );
              if (!success) alert("Error sending document: " + error);
              else setIsAttachmentVisible(false);
            }
            break;
          }
          default:
            alert("Unsupported attachment type: " + type);
        }
      } catch (error) {
        alert("Error handling attachment: " + error.message);
      }
    },
    [roomId, user?.id]
  );

  // Handle typing status
  const handleTyping = useCallback(
    async (isTyping) => {
      if (!user?.id || !roomId) return;

      await updateTypingStatus(roomId, user.id, isTyping);
    },
    [roomId, user?.id]
  );

  // Subscribe to typing status changes
  useTypingSubscription(roomId, async () => {
    const { success, data } = await getTypingUsers(roomId);
    if (success) {
      setTypingUsers(data.filter((user) => user.user_id !== user.id));
    }
  });

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

  // Render messages with red line for new messages
  const renderMessage = (props) => {
    const { currentMessage, previousMessage, ...rest } = props;
    const messageIndex = messages.findIndex(
      (m) => m._id === currentMessage._id
    );
    // If this is the first unread message, render the red line above it
    const isFirstUnread = unread > 0 && messageIndex === unread - 1;
    return (
      <>
        {isFirstUnread && (
          <View
            style={{
              height: 2,
              backgroundColor: "red",
              marginVertical: 8,
              marginHorizontal: 16,
              borderRadius: 1,
            }}
          />
        )}
        <CustomBubble {...props} theme={theme} />
      </>
    );
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
      {/* Custom Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          paddingHorizontal: 12,
          backgroundColor: theme.colors.background,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.grey,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 4, marginRight: 8 }}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAvatarPress}
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
        >
          <View style={{ marginRight: 12 }}>
            <Image
              source={
                typeof chatAvatar === "string"
                  ? { uri: chatAvatar }
                  : chatAvatar
              }
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.greyLight,
              }}
            />
          </View>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 18,
              fontWeight: "bold",
              flexShrink: 1,
            }}
            numberOfLines={1}
          >
            {chatTitle}
          </Text>
        </TouchableOpacity>
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: user.id }}
        text={inputText}
        onInputTextChanged={(text) => {
          setInputText(text);
          handleTyping(text.length > 0);
        }}
        renderBubble={renderMessage}
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
          <TypingIndicator
            typingUsers={typingUsers}
            theme={theme}
            currentUserId={user.id}
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
