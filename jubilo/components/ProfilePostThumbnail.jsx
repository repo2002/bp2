import { getShortContent } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import ThemeText from "./theme/ThemeText";

export default function ProfilePostThumbnail({ post }) {
  const router = useRouter();
  const theme = useTheme();
  const hasImage = post.images && post.images.length > 0 && post.images[0];
  const imageUrl = hasImage
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-media/${post.images[0]}`
    : null;

  return (
    <TouchableOpacity
      style={styles.thumbnail}
      onPress={() =>
        router.push({
          pathname: `/post/${post.id}`,
          params: { postId: post.id },
        })
      }
      activeOpacity={0.8}
    >
      {hasImage ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View
          style={[
            styles.noImageContainer,
            { backgroundColor: theme.colors.cardBackground },
          ]}
        >
          <ThemeText style={styles.textPreview}>
            {getShortContent(post.content, 40) || "No content"}
          </ThemeText>
        </View>
      )}
      {post.is_private && (
        <View style={styles.lockContainer}>
          <MaterialCommunityIcons
            name="lock"
            size={16}
            color={theme.colors.error}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  thumbnail: {
    aspectRatio: 1,
    width: "32%",
    margin: "1%",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImageContainer: {
    flex: 1,
    //justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  textPreview: {
    fontSize: 12,
  },
  lockContainer: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 4,
  },
});
