import defaultAvatar from "@/assets/images/default-avatar.png";
import { getData, getUser, storeData, storeUser } from "@/lib/storage";
import { getChatById, getChatMessages } from "@/services/chatService";
import { getUserData } from "@/services/userService";
import { useCallback, useEffect, useState } from "react";
import useMessagesSubscription from "./useMessagesSubscription";

//Expecting roomId and userId as Hook arguments!!
export default function useChatRoom(roomId, userId) {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCached, setHasCached] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Transform a message to GiftedChat format, using cached user info
  const transformMessage = useCallback(async (msg) => {
    let sender = msg.sender;
    if (sender) {
      let cachedUser = await getUser(sender.id);
      if (cachedUser) {
        sender = cachedUser;
      } else {
        const { success, data } = await getUserData(sender.id);
        if (success && data) {
          sender = data;
          await storeUser(data);
        }
      }
    }
    return {
      _id: msg.id,
      text: msg.content,
      type: msg.type || "text",
      createdAt: new Date(msg.created_at),
      user: {
        _id: sender?.id,
        name:
          `${sender?.first_name || ""} ${sender?.last_name || ""}`.trim() ||
          sender?.username,
        avatar: sender?.image_url || defaultAvatar,
      },
      metadata: msg.metadata,
      isGroup: msg.is_group,
    };
  }, []);

  useEffect(() => {
    if (!roomId || !userId) return;

    // 1. Load from cache first
    getData(`chat_${roomId}`).then((cached) => {
      if (cached) {
        setRoom(cached.room);
        setMessages(cached.messages);
        setUnread(cached.unread);
        setHasCached(true);
        setIsLoading(false);
      }
    });

    // 2. Fetch from server and update cache
    const fetchRoomAndMessages = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const { success, data, error } = await getChatById(roomId, userId);

        if (success) {
          setRoom(data);
          setUnread(data.unread || 0);
          // Transform messages to GiftedChat format and sort newest first
          const transformedMessages = await Promise.all(
            data.messages.map((msg) =>
              transformMessage({
                ...msg,
                is_group: data.is_group,
              })
            )
          );
          transformedMessages.sort((a, b) => b.createdAt - a.createdAt); // Newest first
          setMessages(transformedMessages);
          setHasCached(true);
          setIsLoading(false);
          // Update cache
          storeData(`chat_${roomId}`, {
            room: data,
            messages: transformedMessages,
            unread: data.unread || 0,
          });
        } else {
          setError(error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomAndMessages();
  }, [roomId, userId, transformMessage]);

  // Real-time subscription for new messages
  useMessagesSubscription(roomId, async (payload) => {
    if (payload.eventType === "INSERT") {
      const msg = payload.new;
      const transformed = await transformMessage({
        ...msg,
        sender: msg.sender || {
          id: msg.sender_id,
          first_name: msg.sender_name || "",
          last_name: "",
          username: msg.sender_name || "Unknown",
          image_url: msg.sender_image_url || defaultAvatar,
        },
        is_group: room?.is_group || false,
      });
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg.id)) return prev;
        const updated = [transformed, ...prev];
        // Update cache with new message
        storeData(`chat_${roomId}`, {
          room,
          messages: updated,
          unread,
        });
        return updated;
      });
    }
    //TODO: Handle UPDATE and DELETE
  });

  const loadOlderMessages = async () => {
    if (loadingEarlier || !hasMore || messages.length === 0) return;
    setLoadingEarlier(true);
    try {
      const oldest = messages[messages.length - 1];
      const before = oldest?.createdAt?.toISOString?.() || oldest?.created_at;
      const { success, data } = await getChatMessages(roomId, {
        before,
        limit: 30,
      });
      if (success && data && data.length > 0) {
        const transformed = await Promise.all(
          data.map((msg) => transformMessage(msg))
        );
        // Sort newest first
        transformed.sort((a, b) => b.createdAt - a.createdAt);
        setMessages((prev) => [...prev, ...transformed]);
        if (data.length < 30) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      //TODO: Handle error
    } finally {
      setLoadingEarlier(false);
    }
  };

  return {
    room,
    messages,
    unread,
    isLoading: !hasCached && isLoading,
    error,
    loadOlderMessages,
    hasMore,
    loadingEarlier,
  };
}
