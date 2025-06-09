import EmptyState from "@/components/EmptyState";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useChatSearch } from "@/contexts/SearchContext";
import { getShortContent } from "@/helpers/common";
import useChatList from "@/hooks/chat/useChatList";
import { useTheme } from "@/hooks/theme";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatsIndex() {
  const router = useRouter();
  const theme = useTheme();
  const { search } = useChatSearch();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Use the new chat list hook
  const { chats, loading, error, refetch } = useChatList(user?.id);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const filteredRooms = chats.filter((room) =>
    room?.name?.toLowerCase().includes(search?.toLowerCase() || "")
  );

  const getMessagePreview = (message) => {
    if (!message) return null;

    switch (message.type) {
      case "text":
        return getShortContent(message.text, 30);
      case "image":
        return "📷 Image";
      case "video":
        return "🎥 Video";
      case "audio":
        return "🎵 Voice message";
      case "document":
        return "📄 Document";
      case "invitation":
        return "📅 Event invitation";
      default:
        return "New message";
    }
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours to compare dates only
    const messageDay = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    );
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const yesterdayDay = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    );

    if (messageDay.getTime() === todayDay.getTime()) {
      // Today - show time
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (messageDay.getTime() === yesterdayDay.getTime()) {
      // Yesterday
      return "Yesterday";
    } else {
      // Older - show days ago
      const diffTime = Math.abs(todayDay - messageDay);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/chats/${item.id}`)}
      style={[styles.conversationCard, { borderColor: theme.colors.text }]}
    >
      <Image
        source={
          typeof item.avatar === "string" ? { uri: item.avatar } : item.avatar
        }
        style={styles.avatar}
      />
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <ThemeText style={styles.userName}>{item.name}</ThemeText>
          {item.lastMsg?.createdAt && (
            <ThemeText style={styles.lastMessageTime} color={theme.colors.grey}>
              {formatMessageTime(item.lastMsg.createdAt)}
            </ThemeText>
          )}
        </View>
        <View style={styles.messageContainer}>
          <View style={styles.messageRow}>
            {item.lastMsg?.sender && (
              <ThemeText
                style={styles.senderName}
                color={theme.colors.grey}
                numberOfLines={1}
              >
                {item.lastMsg.sender}:
              </ThemeText>
            )}
            <ThemeText color={theme.colors.grey} numberOfLines={1}>
              {getMessagePreview(item.lastMsg)}
            </ThemeText>
          </View>

          {item.unread > 0 && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.unreadCount}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <EmptyState
          message="Error loading chats"
          subMessage={error}
          action={{
            label: "Try Again",
            onPress: refetch,
          }}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={filteredRooms}
      renderItem={renderConversation}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.listContent,
        { backgroundColor: theme.colors.background },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
      ListEmptyComponent={
        <EmptyState
          message="No chats yet"
          subMessage="Start a new conversation by tapping the + button"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
  },
  conversationCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 16,
    borderBottomWidth: 0.2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  lastMessageTime: {
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    flexGrow: 0,
    minWidth: 0,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
    maxWidth: 150,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
