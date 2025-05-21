import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ThemeText from "./ThemeText";

interface User {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
  username: string;
}

interface Chat {
  _id: Id<"chats">;
  name: string;
  members: Id<"users">[];
  lastMessage?: string;
  lastMessageSender?: string;
  lastMessageTime?: number;
  lastMessageType?: string;
  lastMessageStatus?: string;
  isGroup?: boolean;
  groupName?: string;
  groupImage?: string;
  groupDescription?: string;
  groupAdmins?: Id<"users">[];
  groupCreatedAt?: number;
  groupUpdatedAt?: number;
  groupCreatedBy: Id<"users">;
  unreadCounts?: Array<{
    userId: Id<"users">;
    count: number;
  }>;
}

interface ChatItemProps {
  chat: Chat;
  currentUserId: Id<"users">;
}

export const ChatItem = ({ chat, currentUserId }: ChatItemProps) => {
  const theme = useTheme();

  const getLastMessagePreview = () => {
    if (!chat.lastMessage) return "No messages yet";

    const prefix = chat.lastMessageSender === currentUserId ? "You: " : "";
    return prefix + chat.lastMessage;
  };

  const getTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "";

    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getChatName = () => {
    if (chat.isGroup) return chat.groupName || "Group Chat";
    return chat.name;
  };

  const getUnreadCount = () => {
    if (!chat.unreadCounts) return 0;
    const userCount = chat.unreadCounts.find(
      (uc) => uc.userId === currentUserId
    );
    return userCount?.count || 0;
  };

  const unreadCount = getUnreadCount();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/chat/${chat._id}`)}
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 0.3,
        borderBottomColor: theme.colors.grey,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: theme.colors.primary,
          marginRight: 12,
          overflow: "hidden",
        }}
      >
        {chat.isGroup ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="people" size={24} color={theme.colors.background} />
          </View>
        ) : (
          <Image
            source={{
              uri: chat.groupImage || "https://via.placeholder.com/50",
            }}
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </View>

      {/* Chat Info */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <ThemeText
            style={{
              fontSize: 18,
              fontWeight: "600",
            }}
          >
            {getChatName()}
          </ThemeText>
          <ThemeText
            color={theme.colors.grey}
            style={{
              fontSize: 12,
            }}
          >
            {getTimeAgo(chat.lastMessageTime)}
          </ThemeText>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ThemeText
            color={theme.colors.grey}
            style={{
              fontSize: 14,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {getLastMessagePreview()}
          </ThemeText>

          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: theme.colors.error,
                borderRadius: 12,
                minWidth: 24,
                height: 24,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 6,
                marginLeft: 8,
              }}
            >
              <ThemeText
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </ThemeText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
