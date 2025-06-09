import { Text } from "react-native";

const MessageTimestamp = ({ currentMessage, isCurrentUser, theme, style }) => (
  <Text
    style={{
      fontSize: 10,
      color: isCurrentUser ? "#FFFFFF" : theme.colors.text,
      marginLeft: 62,
      alignSelf: "flex-end",
      paddingBottom: 4,
      paddingLeft: 4,
      paddingRight: 4,
      marginTop: 4,
    }}
  >
    {new Date(currentMessage.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </Text>
);

export default MessageTimestamp;
