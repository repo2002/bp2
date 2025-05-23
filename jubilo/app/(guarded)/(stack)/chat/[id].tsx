import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ThemeText from "../../../../components/ThemeText";
import { useTheme } from "../../../../hooks/useTheme";
import { TextMessage } from "../../../../components/TextMessage";
import { MediaMessage } from "../../../../components/MediaMessage";
import { AudioMessage } from "../../../../components/AudioMessage";
import { FileMessage } from "../../../../components/FileMessage";
import { LocationMessage } from "../../../../components/LocationMessage";
import { TodoMessage } from "../../../../components/TodoMessage";
import { PollMessage } from "../../../../components/PollMessage";
import { SystemMessage } from "../../../../components/SystemMessage";
import { useAuth } from "@clerk/clerk-expo";

export default function Chat() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { userId } = useAuth();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const chatHistory = useQuery(api.chats.getChatHistory, {
    chatId: id as Id<"chats">,
  });
  const chatStats = useQuery(api.chats.getChatStats, {
    chatId: id as Id<"chats">,
  });
  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.chats.markAllMessagesAsRead);

  useEffect(() => {
    if (chatHistory?.messages?.length) {
      markAsRead({ chatId: id as Id<"chats"> });
    }
  }, [chatHistory, id, markAsRead]);

  const handleSend = useCallback(async () => {
    if (!message.trim()) return;

    try {
      await sendMessage({
        chatId: id as Id<"chats">,
        message: message.trim(),
        messageType: "text",
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [message, id, sendMessage]);

  const renderMessage = useCallback(
    ({ item }: { item: any }) => {
      const isOwnMessage = item.senderId === userId;

      switch (item.messageType) {
        case "text":
          return <TextMessage message={item} isOwnMessage={isOwnMessage} />;
        case "image":
        case "video":
          return <MediaMessage message={item} isOwnMessage={isOwnMessage} />;
        case "audio":
          return <AudioMessage message={item} isOwnMessage={isOwnMessage} />;
        case "file":
          return <FileMessage message={item} isOwnMessage={isOwnMessage} />;
        case "location":
          return <LocationMessage message={item} isOwnMessage={isOwnMessage} />;
        case "todo":
          return (
            <TodoMessage
              message={item}
              isOwnMessage={isOwnMessage}
              currentUserId={userId as Id<"users">}
            />
          );
        case "poll":
          return (
            <PollMessage
              message={item}
              isOwnMessage={isOwnMessage}
              currentUserId={userId as Id<"users">}
            />
          );
        default:
          return <SystemMessage message={item} />;
      }
    },
    [userId]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <FlatList
          ref={flatListRef}
          data={chatHistory?.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          inverted
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToOffset({ offset: 0 })
          }
        />
        <View
          style={{
            flexDirection: "row",
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.greyLight,
            backgroundColor: theme.colors.background,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.colors.greyLight,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
              color: theme.colors.text,
            }}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.grey}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            style={{
              backgroundColor: theme.colors.primary,
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ThemeText style={{ color: theme.colors.invertedText }}>
              →
            </ThemeText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
