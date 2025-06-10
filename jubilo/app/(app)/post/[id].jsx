import PostCard from "@/components/PostCard";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { useTheme } from "@/hooks/theme";
import {
  fetchPostById,
  fetchPostsByUser,
  likePost,
} from "@/services/postService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostDetail() {
  const { id, commentId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { openCommentSheet, openShareSheet } = useBottomSheet();
  const [openCommentOnLoad, setOpenCommentOnLoad] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchPostById(id).then(({ data }) => {
        setPost(data);
        if (data && data.user_id) {
          fetchPostsByUser(data.user_id).then(({ data: posts }) =>
            setUserPosts(posts || [])
          );
        }
      });
    }
  }, [id]);

  // Scroll to the specific post when posts are loaded
  useEffect(() => {
    if (id && userPosts.length > 0) {
      const index = userPosts.findIndex((p) => p.id === id);
      if (index !== -1 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToIndex({ index, animated: true });
        }, 100);
      }
    }
  }, [id, userPosts]);

  // Open comment sheet automatically if commentId is present
  useEffect(() => {
    if (post && commentId) {
      openCommentSheet(post, { highlightCommentId: commentId });
    }
  }, [post, commentId, openCommentSheet]);

  const handleCommentPress = (post) => openCommentSheet(post);
  const handleSharePress = (post) => openShareSheet(post);
  const handleLikePress = (post) => likePost(post.id, user.id);

  if (!post) return <ThemeText>Loading...</ThemeText>;

  if (commentId) {
    return (
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <ThemeText style={{ fontSize: 16, fontWeight: "bold" }}>
              Posts
            </ThemeText>
            <ThemeText style={[styles.title, { fontSize: 12 }]}>
              {post.user?.username}
            </ThemeText>
          </View>
          <View>
            <TouchableOpacity>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={theme.colors.background}
              />
            </TouchableOpacity>
          </View>
        </View>
        <PostCard
          post={post}
          user={user}
          commentId={commentId}
          onCommentPress={() => openCommentSheet(post)}
          onSharePress={() => openShareSheet(post)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <ThemeText style={{ fontSize: 16, fontWeight: "bold" }}>
            Posts
          </ThemeText>
          <ThemeText style={[styles.title, { fontSize: 12 }]}>
            {post.user?.username}
          </ThemeText>
        </View>
        <View>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={theme.colors.background}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={userPosts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            user={user}
            onCommentPress={() => openCommentSheet(item)}
            onSharePress={() => openShareSheet(item)}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
