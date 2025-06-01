import ThemeText from "@/components/theme/ThemeText";
import { useAuth } from "@/contexts/AuthContext";
import { useBottomSheet } from "@/contexts/BottomSheetContext";
import { useTheme } from "@/hooks/theme";
import { addComment, deleteComment, getComments } from "@/services/postService";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheetModal from "./BottomSheetModal";
import EmptyState from "./EmptyState";
import ErrorMessage from "./ErrorMessage";
import LoadingIndicator from "./LoadingIndicator";
import UserChip from "./UserChip";

const CommentBottomSheet = forwardRef((_, ref) => {
  const theme = useTheme();
  const snapPoints = useMemo(() => ["80%"], []);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedPost, commentSheetRef } = useBottomSheet();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (selectedPost?.id) fetchComments();
  }, [selectedPost?.id]);

  const fetchComments = async () => {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await getComments(selectedPost.id, {
      order: "asc",
    });
    if (error) setErrorMsg(error.message || "Failed to load comments.");
    setComments(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    const { error } = await addComment(
      selectedPost.id,
      selectedPost.user_id,
      user.id,
      input.trim()
    );
    if (error) setErrorMsg(error.message || "Failed to add comment.");
    setInput("");
    await fetchComments();
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert("Delete", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteComment(commentId);
          await fetchComments();
        },
      },
    ]);
  };

  return (
    <BottomSheetModal
      ref={commentSheetRef}
      snapPoints={snapPoints}
      title="Comments"
    >
      <View style={styles.sheetContent}>
        {/* PostCard at the top */}
        {/* <PostCard post={post} user={user} /> */}
        {/* Comments list */}
        <ErrorMessage error={errorMsg} />
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, marginBottom: 8 }}
          contentContainerStyle={{ paddingBottom: 8 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.commentRow,
                {
                  backgroundColor: theme.colors.cardBackground,
                  padding: 16,
                  borderRadius: 10,
                },
              ]}
            >
              <UserChip user={item.user} size={40} style={{ flex: 1 }}>
                <ThemeText style={{ fontSize: 14 }}>{item.content}</ThemeText>
              </UserChip>
              {user?.id === item.user?.id && (
                <TouchableOpacity
                  onPress={() => handleDeleteComment(item.id)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              )}
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={24}
        >
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.grey}
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.cardBackground,
                  padding: 16,
                  borderRadius: 10,
                },
              ]}
              editable={!submitting}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !input.trim()}
            >
              <Ionicons name="send" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    padding: 0,
    gap: 0,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
});

export default CommentBottomSheet;
