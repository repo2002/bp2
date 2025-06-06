import { sendMessage as sendMessageService } from "@/services/chatService";
import { useCallback } from "react";

export default function useSendMessage(roomId, userId) {
  const sendMessage = useCallback(
    async (newMessages = []) => {
      if (!userId || !roomId) return;

      try {
        const message = newMessages[0];
        const { success, error } = await sendMessageService(
          roomId,
          userId,
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
    [roomId, userId]
  );

  return { sendMessage };
}
