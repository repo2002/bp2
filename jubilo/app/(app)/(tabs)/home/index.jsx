import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import PostCard from "@/components/PostCard";
import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { usePrivacy } from "@/contexts/PrivacyContext";
import { useTheme } from "@/hooks/theme";
import { supabase } from "@/lib/supabase";
import { fetchPosts } from "@/services/postService";
import { getUserData } from "@/services/userService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LIMIT = 10;

export default function Home() {
  const { user } = useAuth();
  const { canViewPost } = usePrivacy();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { openCommentSheet, openShareSheet } = useBottomSheet();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offset, setOffset] = useState(0);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadInitialPosts();
    setupRealtimeSubscriptions();
  }, []);

  const setupRealtimeSubscriptions = () => {
    // Single channel for all feed updates
    const feedSubscription = supabase
      .channel("feed_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newPost = payload.new;
            // Only add the post if it's not private or if the user can view it
            if (!newPost.is_private || canViewPost(newPost.user_id, true)) {
              // Fetch the user data for the new post
              const { data: userData } = await getUserData(newPost.user_id);
              newPost.user = userData;
              // Check if the post already exists in the array
              setPosts((prev) => {
                const postExists = prev.some((post) => post.id === newPost.id);
                if (postExists) return prev;
                return [newPost, ...prev];
              });
            }
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) =>
              prev.filter((post) => post.id !== payload.old.id)
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        (payload) => {
          setPosts((prev) =>
            prev.map((post) => {
              if (post.id === payload.new.post_id) {
                const updatedLikes =
                  payload.eventType === "INSERT"
                    ? [...(post.likes || []), payload.new]
                    : (post.likes || []).filter(
                        (like) => like.id !== payload.old.id
                      );
                return {
                  ...post,
                  likes: updatedLikes,
                  like_count: updatedLikes.length,
                };
              }
              return post;
            })
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Get full user data for the new comment
            const { data: userData } = await supabase
              .from("profiles")
              .select("id, username, image_url")
              .eq("id", payload.new.user_id)
              .single();

            if (userData) {
              payload.new.user = userData;
            }
          }

          setPosts((prev) =>
            prev.map((post) => {
              if (post.id === payload.new.post_id) {
                let updatedComments;

                if (payload.eventType === "INSERT") {
                  // For INSERT, check if we need to update the comment
                  const existingCommentIndex = post.comments?.findIndex(
                    (comment) => comment.id === payload.new.id
                  );

                  if (existingCommentIndex !== -1) {
                    // Update existing comment if needed
                    updatedComments = [...(post.comments || [])];
                    updatedComments[existingCommentIndex] = payload.new;
                  } else {
                    // Add new comment
                    updatedComments = [...(post.comments || []), payload.new];
                  }
                } else {
                  // For DELETE, remove the comment
                  updatedComments = (post.comments || []).filter(
                    (comment) => comment.id !== payload.old.id
                  );
                }

                return {
                  ...post,
                  comments: updatedComments,
                  comment_count: updatedComments.length,
                };
              }
              return post;
            })
          );
        }
      )
      .subscribe((status) => {
        console.log("Feed subscription status:", status);
      });

    return () => {
      feedSubscription.unsubscribe();
    };
  };

  const loadInitialPosts = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await fetchPosts({ limit: LIMIT, offset: 0 });
      if (error) throw error;

      // Filter out private posts that the user can't view
      const filteredPosts = data.filter(
        (post) => !post.is_private || canViewPost(post.user_id, true)
      );

      // Ensure no duplicate posts
      const uniquePosts = filteredPosts.filter(
        (post, index, self) => index === self.findIndex((p) => p.id === post.id)
      );

      setPosts(uniquePosts);
      setOffset(uniquePosts.length);
      setNoMorePosts(uniquePosts.length < LIMIT);
    } catch (error) {
      console.error("Error loading posts:", error);
      setErrorMsg(error.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const loadOlderPosts = async () => {
    if (loading || noMorePosts) return;

    try {
      setLoading(true);
      const { data, error } = await fetchPosts({ limit: LIMIT, offset });
      if (error) throw error;

      // Filter out private posts that the user can't view
      const filteredPosts = data.filter(
        (post) => !post.is_private || canViewPost(post.user_id, true)
      );

      if (filteredPosts.length === 0) {
        setNoMorePosts(true);
        return;
      }

      // Ensure no duplicate posts when adding older posts
      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.id));
        const newPosts = filteredPosts.filter(
          (post) => !existingIds.has(post.id)
        );
        return [...prev, ...newPosts];
      });

      setOffset((prev) => prev + filteredPosts.length);
      setNoMorePosts(filteredPosts.length < LIMIT);
    } catch (error) {
      console.error("Error loading more posts:", error);
      setErrorMsg(error.message || "Failed to load more posts");
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    setRefreshing(true);
    setOffset(0);
    setNoMorePosts(false);
    setErrorMsg(null);
    const { data: newPosts, error } = await fetchPosts({
      limit: LIMIT,
      offset: 0,
    });
    if (error) setErrorMsg(error.message || "Failed to refresh posts.");

    // Filter out private posts that the user can't view
    const filteredPosts = newPosts.filter(
      (post) => !post.is_private || canViewPost(post.user_id, true)
    );

    // Ensure no duplicate posts
    const uniquePosts = filteredPosts.filter(
      (post, index, self) => index === self.findIndex((p) => p.id === post.id)
    );

    setPosts(uniquePosts || []);
    setOffset((uniquePosts || []).length);
    setRefreshing(false);
    if ((uniquePosts || []).length < LIMIT) setNoMorePosts(true);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={[styles.header, { borderColor: theme.colors.greyLight }]}>
        <ThemeText style={styles.title}>Jubilo</ThemeText>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => router.push("/search")}
            style={styles.createButton}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={26}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              router.push("/notifications");
            }}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={26}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              router.push("/post");
            }}
          >
            <MaterialCommunityIcons
              name="plus-box-outline"
              size={26}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              router.push("/profile");
            }}
          >
            <Avatar
              size={30}
              uri={user?.image_url}
              style={{
                borderWidth: 2,
                borderColor: user?.is_verified ? "gold" : "transparent",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ErrorMessage error={errorMsg} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            user={user}
            onCommentPress={() => openCommentSheet(item)}
            onSharePress={() => openShareSheet(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        onEndReached={loadOlderPosts}
        onEndReachedThreshold={0.5}
        onRefresh={refreshPosts}
        refreshing={refreshing}
        ListFooterComponent={
          loading ? (
            <LoadingIndicator text="Loading posts..." />
          ) : noMorePosts ? (
            <EmptyState message="No more posts" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.2,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  title: {
    fontSize: 32,
  },
  feed: {
    padding: 16,
    gap: 16,
  },
  postCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 14,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 14,
  },
});
