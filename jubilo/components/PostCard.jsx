import ThemeText from "@/components/theme/ThemeText";
import { getShortContent, timeAgo } from "@/helpers/common";
import { useTheme } from "@/hooks/theme";
import { getPostLikes, likePost, unlikePost } from "@/services/postService";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import UserChip from "./UserChip";

const SUPABASE_STORAGE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/post-media";

const SCREEN_WIDTH = Dimensions.get("window").width;

const PostCard = memo(
  ({ post, user, onCommentPress, onSharePress, onLikePress }) => {
    const theme = useTheme();
    const images = Array.isArray(post.images) ? post.images : [];
    const comments = Array.isArray(post.comments) ? post.comments : [];
    const commentsCount = comments.length;
    const lastComment = commentsCount > 0 ? comments[commentsCount - 1] : null;
    const [likeCount, setLikeCount] = useState(post.like_count || 0);
    const [likedByUser, setLikedByUser] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [heartScale] = useState(new Animated.Value(0));
    const [heartOpacity] = useState(new Animated.Value(0));
    const [lastTap, setLastTap] = useState(null);

    const baseStyle = useMemo(
      () => ({
        color: theme.colors.text,
        fontSize: 16,
      }),
      [theme.colors.text]
    );

    const renderersProps = useMemo(
      () => ({
        a: {
          onPress: (url) => {
            // Handle link press
            console.log("Link pressed:", url);
          },
        },
      }),
      []
    );

    const tagsStyles = useMemo(
      () => ({
        body: {
          color: theme.colors.text,
          fontSize: 14,
        },
        p: {
          marginBottom: 8,
        },
      }),
      [theme.colors.text]
    );

    useEffect(() => {
      let mounted = true;
      async function fetchLikes() {
        if (!user?.id) return;
        try {
          const { data, error } = await getPostLikes(post.id, user.id);
          if (error) throw error;
          if (mounted) {
            setLikeCount(data.likeCount);
            setLikedByUser(data.likedByUser);
          }
        } catch (error) {
          console.error("Error fetching likes:", error);
          // Don't show error to user for initial load
        }
      }
      fetchLikes();
      return () => {
        mounted = false;
      };
    }, [post.id, user?.id]);

    const handleLike = useCallback(async () => {
      if (!user?.id || likeLoading) return;

      // Optimistic update
      const previousLikeCount = likeCount;
      const previousLikedState = likedByUser;

      setLikeLoading(true);
      setLikeCount((prev) => (likedByUser ? Math.max(0, prev - 1) : prev + 1));
      setLikedByUser((prev) => !prev);

      try {
        if (likedByUser) {
          const { error } = await unlikePost(post.id, user.id);
          if (error) throw error;
        } else {
          const { error } = await likePost(post.id, user.id);
          if (error) throw error;
        }
      } catch (error) {
        console.error("Error updating like:", error);
        // Revert optimistic update
        setLikeCount(previousLikeCount);
        setLikedByUser(previousLikedState);
        Alert.alert("Error", "Failed to update like. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setLikeLoading(false);
      }
    }, [post.id, user?.id, likedByUser, likeLoading, likeCount]);

    const showHeartAnimation = useCallback(() => {
      heartScale.setValue(0.5);
      heartOpacity.setValue(0);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(heartOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(heartOpacity, {
            toValue: 0,
            duration: 300,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(heartScale, {
            toValue: 1.4,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(heartScale, {
            toValue: 0,
            duration: 250,
            delay: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [heartScale, heartOpacity]);

    const handleDoubleTap = useCallback(() => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;
      if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
        if (!likedByUser) {
          handleLike();
          showHeartAnimation();
        }
        setLastTap(null);
      } else {
        setLastTap(now);
      }
    }, [lastTap, likedByUser, handleLike, showHeartAnimation]);

    const handleCommentPress = useCallback(() => {
      if (!user?.id) {
        Alert.alert("Sign In Required", "Please sign in to comment on posts.", [
          { text: "OK" },
        ]);
        return;
      }
      onCommentPress(post);
    }, [onCommentPress, post, user?.id]);

    const handleSharePress = useCallback(() => {
      if (!user?.id) {
        Alert.alert("Sign In Required", "Please sign in to share posts.", [
          { text: "OK" },
        ]);
        return;
      }
      onSharePress(post);
    }, [onSharePress, post, user?.id]);

    return (
      <View
        style={{
          width: "100%",
          backgroundColor: theme.colors.cardBackground,
          marginBottom: 4,
          marginTop: 4,
          borderRadius: 12,
        }}
      >
        {/* Header: Avatar, Username, Timestamp, Location */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
            paddingHorizontal: 16,
            paddingVertical: 8,
            justifyContent: "space-between",
          }}
        >
          {/* Left: Avatar + (username & location) */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <UserChip
              user={post.user}
              size={40}
              children={
                <>
                  {post.location?.description && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 4,
                      }}
                    >
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <ThemeText
                        color={theme.colors.primary}
                        style={{ fontSize: 12 }}
                      >
                        {getShortContent(post.location.description, 20)}
                      </ThemeText>
                    </View>
                  )}
                </>
              }
            />
          </View>
          {/* Right: Timestamp */}
          <ThemeText
            style={{
              color: theme.colors.grey,
              fontSize: 13,
              marginLeft: 8,
              textAlign: "right",
              minWidth: 60,
            }}
          >
            {timeAgo(post.created_at)}
          </ThemeText>
        </View>

        {/* Content */}
        {post.content && (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <RenderHTML
              source={{ html: post.content }}
              baseStyle={baseStyle}
              renderersProps={renderersProps}
              tagsStyles={tagsStyles}
              contentWidth={SCREEN_WIDTH - 32}
            />
          </View>
        )}

        {/* Images */}
        {images.length > 0 && (
          <View style={{ position: "relative" }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ width: "100%", flexGrow: 0, marginBottom: 8 }}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {images.map((relPath, idx) => (
                <TouchableOpacity
                  key={relPath + idx}
                  activeOpacity={1}
                  onPress={handleDoubleTap}
                  style={{ width: SCREEN_WIDTH }}
                >
                  <RNImage
                    source={{ uri: `${SUPABASE_STORAGE_URL}/${relPath}` }}
                    style={{
                      width: SCREEN_WIDTH,
                      height: 400,
                      resizeMode: "cover",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ scale: heartScale }],
                opacity: heartOpacity,
              }}
            >
              <Ionicons
                name="heart"
                size={100}
                color="white"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              />
            </Animated.View>
          </View>
        )}

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 8,
            marginBottom: 8,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left actions */}
          <View style={{ flexDirection: "row", gap: 16, flex: 1 }}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onLikePress ? () => onLikePress(post) : handleLike}
            >
              <Ionicons
                name={likedByUser ? "heart" : "heart-outline"}
                size={22}
                color={likedByUser ? theme.colors.error : theme.colors.error}
              />
              <ThemeText style={styles.actionText}>{likeCount}</ThemeText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleCommentPress}
            >
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color={theme.colors.primary}
              />
              <ThemeText style={styles.actionText}>{commentsCount}</ThemeText>
            </TouchableOpacity>
          </View>
          {/* Right action */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleSharePress}>
            <Ionicons
              name="share-outline"
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Comments Preview */}
        {commentsCount > 0 && (
          <View style={styles.commentsPreview}>
            {lastComment && (
              <View style={styles.lastComment}>
                <ThemeText style={styles.commentUsername}>
                  {lastComment.user?.username}
                </ThemeText>
                <ThemeText style={styles.commentText}>
                  {getShortContent(lastComment.content, 30)}
                </ThemeText>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
);

PostCard.displayName = "PostCard";

export default PostCard;

const styles = StyleSheet.create({
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 14,
  },
  commentsPreview: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentsCount: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastComment: {
    flexDirection: "row",
    gap: 4,
  },
  commentUsername: {
    fontWeight: "bold",
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
  },
});
