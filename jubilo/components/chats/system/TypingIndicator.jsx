import { Text, View } from "react-native";

const TypingIndicator = ({ typingUsers = [], theme, currentUserId }) => {
  // Filter out the current user
  const othersTyping = typingUsers.filter((u) => u.user_id !== currentUserId);
  if (!othersTyping.length) return null;
  // Compose names
  const names = othersTyping
    .map(
      (u) =>
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        "Unknown"
    )
    .join(", ");
  return (
    <View
      style={{
        backgroundColor: theme.colors.greyLight,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        minHeight: 24,
        minWidth: 60,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 4,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 14 }}>
        {names} {othersTyping.length === 1 ? "is" : "are"} typing...
      </Text>
    </View>
  );
};

export default TypingIndicator;
