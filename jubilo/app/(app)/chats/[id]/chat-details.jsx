import defaultAvatar from "@/assets/images/default-avatar.png";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/theme";
import { getChatById } from "@/services/chatService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatDetails() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchChat = async () => {
      if (!params?.id) return;
      setLoading(true);
      const { success, data } = await getChatById(params.id);
      if (success) setChat(data);
      setLoading(false);
    };
    fetchChat();
  }, [params?.id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!chat || chat.is_group) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.text }}>No chat details found.</Text>
      </View>
    );
  }

  // Find the other participant
  const other = chat.participants?.find((p) => p.user && p.user.id !== user.id);
  const avatar = other?.user?.image_url || defaultAvatar;
  const name = other
    ? [other.user.first_name, other.user.last_name].filter(Boolean).join(" ") ||
      other.user.username
    : "Unknown";
  const username = other?.user?.username || "";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {/* Custom Header (matches chat screen) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: insets.top + 8,
          paddingBottom: 8,
          paddingHorizontal: 12,
          backgroundColor: theme.colors.background,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.grey,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 4, marginRight: 8 }}
        >
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View style={{ marginRight: 12 }}>
            <Image
              source={typeof avatar === "string" ? { uri: avatar } : avatar}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.greyLight,
              }}
            />
          </View>
          <View style={{ flexShrink: 1 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: "bold",
              }}
              numberOfLines={1}
            >
              {name}
            </Text>
            <Text
              style={{ color: theme.colors.grey, fontSize: 14 }}
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
      </View>
      {/* Details content */}
      <View style={{ alignItems: "center", marginTop: 32 }}>
        <Image
          source={typeof avatar === "string" ? { uri: avatar } : avatar}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.greyLight,
          }}
        />
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 22,
            fontWeight: "bold",
            marginTop: 16,
          }}
        >
          {name}
        </Text>
        <Text style={{ color: theme.colors.grey, fontSize: 16, marginTop: 4 }}>
          {username}
        </Text>
        {/* Add more chat actions/info here */}
        <View style={{ marginTop: 32 }}>
          <Text style={{ color: theme.colors.grey }}>
            Chat actions and info coming soon...
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
