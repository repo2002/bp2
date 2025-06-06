import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ChatHeader({
  chatTitle,
  chatAvatar,
  onBack,
  onAvatarPress,
  insets,
  theme,
}) {
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.grey,
        },
      ]}
    >
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onAvatarPress} style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={
              typeof chatAvatar === "string" ? { uri: chatAvatar } : chatAvatar
            }
            style={styles.avatar}
          />
        </View>
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {chatTitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0", // fallback color
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flexShrink: 1,
  },
});
