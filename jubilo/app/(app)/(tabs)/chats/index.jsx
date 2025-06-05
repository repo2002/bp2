import defaultAvatar from "@/assets/images/default-avatar.png";
import EmptyState from "@/components/EmptyState";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useChatSearch } from "@/contexts/SearchContext";
import { useTheme } from "@/hooks/theme";
import useRoomSubscription from "@/hooks/useRoomSubscription";
import { supabase } from "@/lib/supabase";
import { getUnreadCount, getUserChats } from "@/services/chatService";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateChat = useCallback(
    (newChat) => {
      // Refresh the chat list to include the new chat
      fetchChats();
    },
    [fetchChats]
  );

  const fetchChats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const { success, data, error } = await getUserChats(user.id);

      if (success) {
        const formattedRooms = await Promise.all(
          data.map(async (room) => {
            const lastMsg =
              room.last_message && room.last_message.length > 0
                ? room.last_message[0]
                : null;
            // For direct chats, find the other participant
            const otherParticipant = room.participants?.find(
              (p) => p.user && p.user.id !== user.id
            );

            // Compose display name for the other participant
            let participantName = null;
            if (otherParticipant && otherParticipant.user) {
              const { first_name, last_name, username } = otherParticipant.user;
              participantName = [first_name, last_name]
                .filter(Boolean)
                .join(" ");
              if (!participantName) participantName = username || "Unknown";
            }

            // Compose display name for the last message sender
            let lastMsgSender = null;
            if (lastMsg?.sender) {
              const { first_name, last_name, username } = lastMsg.sender;
              lastMsgSender = [first_name, last_name].filter(Boolean).join(" ");
              if (!lastMsgSender) lastMsgSender = username || "Unknown";
            }

            // Always show a fallback avatar
            let avatar = room.is_group
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  room.name
                )}`
              : otherParticipant?.user?.image_url
              ? otherParticipant.user.image_url
              : defaultAvatar;

            // Get unread count
            const { success: unreadSuccess, data: unreadCount } =
              await getUnreadCount(room.id, user.id);

            return {
              id: room.id,
              name: room.is_group ? room.name : participantName,
              is_group: room.is_group,
              avatar,
              lastMsg: lastMsg
                ? {
                    text: lastMsg.content,
                    sender: lastMsgSender,
                    createdAt: lastMsg.created_at,
                    type: lastMsg.type,
                  }
                : null,
              unread: unreadSuccess ? unreadCount : 0,
              participants: room.participants,
            };
          })
        );

        setRooms(formattedRooms);
      } else {
        setError(error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchChats();

    // Subscribe to new messages
    const subscription = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchChats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChats();
  }, [fetchChats]);

  const filteredRooms = rooms.filter((room) =>
    room?.name?.toLowerCase().includes(search?.toLowerCase() || "")
  );

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/chats/${item.id}`)}
      style={[styles.conversationCard, { borderColor: theme.colors.text }]}
    >
      <Image
        source={
          typeof item.avatar === "string" ? { uri: item.avatar } : item.avatar // this will be the local image if not a string
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

  useRoomSubscription(fetchChats);
  // Optionally, subscribe to all participants/messages changes for all rooms:
  // useParticipantsSubscription(null, fetchChats);
  // useMessagesSubscription(null, fetchChats);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
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
            onPress: fetchChats,
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
