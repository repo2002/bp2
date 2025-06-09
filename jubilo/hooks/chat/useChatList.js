import defaultAvatar from "@/assets/images/default-avatar.png";
import { getData, getUser, storeData, storeUser } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { getUnreadCount, getUserChats } from "@/services/chatService";
import { getUserData } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";

export default function useChatList(userId) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCached, setHasCached] = useState(false);

  // Batch user info fetching for all participants and last message senders
  const batchFetchUsers = useCallback(async (data) => {
    const userIds = new Set();
    data.forEach((room) => {
      room.participants?.forEach((p) => p.user && userIds.add(p.user.id));
      if (room.last_message && room.last_message[0]?.sender?.id) {
        userIds.add(room.last_message[0].sender.id);
      }
    });
    const userInfoMap = {};
    await Promise.all(
      Array.from(userIds).map(async (id) => {
        let user = await getUser(id);
        if (!user) {
          const { success, data } = await getUserData(id);
          if (success && data) {
            user = data;
            await storeUser(data);
          }
        }
        if (user) userInfoMap[id] = user;
      })
    );
    return userInfoMap;
  }, []);

  const fetchChats = useCallback(async () => {
    if (!userId) return;
    // 1. Load from cache first
    const cached = await getData(`chats_${userId}`);
    if (cached) {
      setChats(cached);
      setHasCached(true);
      setLoading(false);
    }
    try {
      setError(null);
      const { success, data, error } = await getUserChats(userId);
      if (success) {
        const userInfoMap = await batchFetchUsers(data);
        const formattedRooms = await Promise.all(
          data.map(async (room) => {
            const lastMsg =
              room.last_message && room.last_message.length > 0
                ? room.last_message[0]
                : null;
            // For direct chats, find the other participant
            let otherParticipant = room.participants?.find(
              (p) => p.user && p.user.id !== userId
            );
            let participantUser = otherParticipant?.user;
            if (participantUser && userInfoMap[participantUser.id]) {
              participantUser = userInfoMap[participantUser.id];
            }
            // Compose display name for the other participant
            let participantName = null;
            if (participantUser) {
              const { first_name, last_name, username } = participantUser;
              participantName = [first_name, last_name]
                .filter(Boolean)
                .join(" ");
              if (!participantName) participantName = username || "Unknown";
            }
            // Compose display name for the last message sender
            let lastMsgSender = null;
            let lastMsgSenderUser = lastMsg?.sender;
            if (lastMsgSenderUser && userInfoMap[lastMsgSenderUser.id]) {
              lastMsgSenderUser = userInfoMap[lastMsgSenderUser.id];
            }
            if (lastMsgSenderUser) {
              if (lastMsgSenderUser.id === userId) {
                lastMsgSender = "You";
              } else {
                const { first_name, last_name, username } = lastMsgSenderUser;
                lastMsgSender = [first_name, last_name]
                  .filter(Boolean)
                  .join(" ");
                if (!lastMsgSender) lastMsgSender = username || "Unknown";
              }
            }
            // Always show a fallback avatar
            let avatar = room.is_group
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  room.name
                )}`
              : participantUser?.image_url
              ? participantUser.image_url
              : defaultAvatar;
            // Get unread count
            const { success: unreadSuccess, data: unreadCount } =
              await getUnreadCount(room.id, userId);
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
        setChats(formattedRooms);
        setHasCached(true);
        setLoading(false);
        storeData(`chats_${userId}`, formattedRooms);
      } else {
        setError(error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, batchFetchUsers]);

  useEffect(() => {
    fetchChats();
    // Subscribe to all relevant events
    const sub = supabase
      .channel("chat_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        fetchChats
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_rooms" },
        fetchChats
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_participants" },
        fetchChats
      )
      .subscribe();
    return () => sub.unsubscribe();
  }, [fetchChats]);

  return { chats, loading: !hasCached && loading, error, refetch: fetchChats };
}
