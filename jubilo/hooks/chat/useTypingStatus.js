import { getTypingUsers, updateTypingStatus } from "@/services/chatService";
import { useCallback, useState } from "react";
import useTypingSubscription from "./useTypingSubscription";

export default function useTypingStatus(roomId, userId) {
  const [typingUsers, setTypingUsers] = useState([]);

  const handleTyping = useCallback(
    async (isTyping) => {
      if (!userId || !roomId) return;
      await updateTypingStatus(roomId, userId, isTyping);
    },
    [roomId, userId]
  );

  useTypingSubscription(roomId, async () => {
    const { success, data } = await getTypingUsers(roomId);
    if (success) {
      setTypingUsers(data.filter((user) => user.user_id !== userId));
    }
  });

  return { typingUsers, handleTyping };
}
