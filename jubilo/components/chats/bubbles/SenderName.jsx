import { getGroupMemberColor } from "@/constants/groupColors";
import { Text } from "react-native";

const SenderName = ({ currentMessage, isCurrentUser, theme }) => {
  if (isCurrentUser) return null;
  return (
    <Text
      style={{
        color: currentMessage.isGroup
          ? getGroupMemberColor(currentMessage.user._id)
          : theme.colors.grey,
        fontSize: 14,
        marginBottom: 4,
        padding: 8,
        fontWeight: "700",
        alignSelf: "flex-start",
      }}
    >
      {currentMessage.user.name}
    </Text>
  );
};

export default SenderName;
