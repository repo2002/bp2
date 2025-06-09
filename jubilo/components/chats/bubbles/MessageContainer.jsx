import { View } from "react-native";

const MessageContainer = ({ isCurrentUser, theme, children }) => (
  <View
    style={{
      backgroundColor: isCurrentUser
        ? theme.colors.primary
        : theme.colors.cardBackground,
      borderRadius: 10,
      padding: 0,
    }}
  >
    {children}
  </View>
);

export default MessageContainer;
