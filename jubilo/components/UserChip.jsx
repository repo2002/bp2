import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Avatar from "./Avatar";
import ThemeText from "./theme/ThemeText";

export default function UserChip({
  user,
  size = 32,
  subtitle,
  style,
  children,
}) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  if (!user) return null;

  const handlePress = () => {
    if (!user.id) return;
    if (authUser?.id === user.id) {
      router.push("/profile");
    } else {
      router.push(`/profile/${user.id}`);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.row, style]}>
        <Avatar uri={user.image_url} size={size} />
        <View style={styles.texts}>
          <ThemeText style={styles.username}>{user.username}</ThemeText>
          {subtitle && (
            <ThemeText style={styles.subtitle}>{subtitle}</ThemeText>
          )}
          {children}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  texts: {
    flexDirection: "column",
    justifyContent: "center",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
