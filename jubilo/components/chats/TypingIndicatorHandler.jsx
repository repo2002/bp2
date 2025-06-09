import TypingIndicator from "@/components/chats/system/TypingIndicator";
import useTypingSubscription from "@/hooks/chat/useTypingSubscription";
import { getTypingUsers } from "@/services/chatService";
import { useState } from "react";

export default function TypingIndicatorHandler({ roomId, userId }) {
  const [typingUsers, setTypingUsers] = useState([]);

  useTypingSubscription(roomId, async () => {
    const { success, data } = await getTypingUsers(roomId);
    if (success) {
      setTypingUsers(data.filter((user) => user.user_id !== userId));
    }
  });

  if (!typingUsers.length) return null;

  return <TypingIndicator typingUsers={typingUsers} />;
}
