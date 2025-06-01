import { useTheme } from "@/hooks/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function Post({ post }) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.usernameContainer}>
            <ThemeText style={styles.username}>{post.user.username}</ThemeText>
            {post.user.is_private && (
              <MaterialCommunityIcons
                name="lock"
                size={14}
                color={theme.colors.grey}
                style={styles.lockIcon}
              />
            )}
          </View>
          <ThemeText style={styles.timestamp}>
            {new Date(post.created_at).toLocaleDateString()}
          </ThemeText>
        </View>
      </View>
      {/* Rest of your post content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  lockIcon: {
    marginLeft: 4,
  },
  timestamp: {
    color: "#666",
    fontSize: 12,
  },
});
