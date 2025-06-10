import { useAuth } from "@/contexts/AuthContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { useTheme } from "@/hooks/theme";
import { addComment, deleteComment } from "@/services/postService";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "./Avatar";
import BottomSheetModal from "./BottomSheetModal";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "./LoadingIndicator";
import ThemeText from "./theme/ThemeText";

const CommentBottomSheet = forwardRef(({ post, highlightCommentId }, ref) => {
  const theme = useTheme();
  const snapPoints = useMemo(() => ["85%"]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedPost, commentSheetRef } = useBottomSheet();
  const [errorMsg, setErrorMsg] = useState(null);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedPost?.id) {
      // Use the comments from the post prop
      setComments(selectedPost.comments || []);
    }
  }, [selectedPost?.id, selectedPost?.comments]);

  useEffect(() => {
    if (highlightCommentId && comments.length > 0) {
      const index = comments.findIndex((c) => c.id === highlightCommentId);
      if (index !== -1 && flatListRef.current) {
        setTimeout(() => {
          flatListRef.current.scrollToIndex({ index, animated: true });
        }, 100);
      }
    }
  }, [highlightCommentId, comments]);

  const handleSubmit = async () => {
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await addComment(
        selectedPost.id,
        selectedPost.user_id,
        user.id,
        input.trim()
      );
      if (error) throw error;
      setInput("");
    } catch (error) {
      setErrorMsg(error.message || "Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert("Delete", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteComment(commentId);
        },
      },
    ]);
  };

  const handleClose = () => {
    // Implement the close logic
  };

  return (
    <BottomSheetModal
      ref={commentSheetRef}
      snapPoints={snapPoints}
      title="Comments"
      keyboardBehavior="extend"
    >
      <View style={styles.sheetContent}>
        {/* PostCard at the top */}
        {/* <PostCard post={post} user={user} /> */}
        {/* Comments list */}
        <ErrorMessage error={errorMsg} />
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item.id}
          style={{ marginBottom: 8 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.commentRow,
                {
                  justifyContent: "space-between",
                  borderBottomWidth: 0.3,
                  paddingBottom: 8,
                  borderColor: theme.colors.text,
                },
                item.id === highlightCommentId && {
                  backgroundColor: "#ffe082",
                  borderRadius: 6,
                },
              ]}
            >
              <View style={{ flexDirection: "row", gap: 8, flex: 1 }}>
                <Avatar uri={item.user?.image_url} size={40} />
                <View style={{ flexDirection: "column", gap: 4, flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemeText style={{ fontSize: 12, paddingVertical: 4 }}>
                      {item.user?.username}
                    </ThemeText>
                    {user?.id === item.user?.id && (
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(item.id)}
                        style={{
                          marginLeft: 8,
                          alignSelf: "flex-start",
                          backgroundColor: theme.colors.error + "20",
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 4,
                        }}
                      >
                        <ThemeText
                          color={theme.colors.error}
                          style={{ fontSize: 12 }}
                        >
                          Delete
                        </ThemeText>
                      </TouchableOpacity>
                    )}
                  </View>

                  <ThemeText
                    style={{
                      fontSize: 14,
                      flexWrap: "wrap",
                      flexShrink: 1,
                    }}
                    numberOfLines={null}
                  >
                    {item.content}
                  </ThemeText>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            loading ? (
              <LoadingIndicator text="Loading comments..." />
            ) : (
              <EmptyState message="No comments yet." />
            )
          }
        />
        {/* Input at the bottom */}
        <View style={styles.inputContainer}>
          <BottomSheetTextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.colors.grey}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || !input.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor: input.trim()
                  ? theme.colors.primary
                  : theme.colors.greyLight,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() ? "#fff" : theme.colors.grey}
            />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  commentBubble: {
    borderRadius: 10,
    padding: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,

    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default CommentBottomSheet;
