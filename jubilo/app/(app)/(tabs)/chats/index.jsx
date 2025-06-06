import EmptyState from "@/components/EmptyState";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useChatSearch } from "@/contexts/SearchContext";
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
            <ThemeText style={styles.lastMessageTime}>
              {new Date(item.lastMsg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemeText>
          )}
        </View>
        <View style={styles.messageContainer}>
          <View style={styles.messageRow}>
            {item.is_group && item.lastMsg?.sender && (
              <ThemeText style={styles.senderName} numberOfLines={1}>
                {item.lastMsg.sender}:
              </ThemeText>
            )}
            <ThemeText color={theme.colors.grey} numberOfLines={1}>
              {item.lastMsg?.type === "text"
                ? item.lastMsg.text
                : item.lastMsg?.type === "image"
                ? "📷 Image"
                : item.lastMsg?.type === "video"
                ? "🎥 Video"
                : item.lastMsg?.type === "audio"
                ? "🎵 Voice message"
                : "New message"}
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
    color: "#888",
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
    color: "#888",
    maxWidth: 100,
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
