import CustomBubble from "@/components/chats/ChatComponents";
import { View } from "react-native";

export default function renderMessage(props) {
  const {
    currentMessage,
    previousMessage,
    messages = [],
    unread = 0,
    theme,
  } = props;
  if (!currentMessage) return null;
  const messageIndex = messages.findIndex((m) => m._id === currentMessage._id);
  const isFirstUnread = unread > 0 && messageIndex === unread - 1;
  return (
    <>
      {isFirstUnread && (
        <View
          style={{
            height: 2,
            backgroundColor: "red",
            marginVertical: 8,
            marginHorizontal: 16,
            borderRadius: 1,
          }}
        />
      )}
      <CustomBubble {...props} theme={theme} />
    </>
  );
}
