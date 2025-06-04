import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { createEventPost, getEventPosts } from "@/services/events";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventPostList({ eventId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { posts: fetchedPosts } = await getEventPosts(eventId);
      setPosts(fetchedPosts || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [eventId]);

  const handleAddPost = async () => {
    if (!newPost.trim()) return;
    setSubmitting(true);
    try {
      await createEventPost(eventId, newPost.trim());
      setNewPost("");
      fetchPosts();
    } catch (e) {}
    setSubmitting(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.cardBackground,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          value={newPost}
          onChangeText={setNewPost}
          placeholder="Write a post..."
          placeholderTextColor={theme.colors.textSecondary}
          editable={!submitting}
        />
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleAddPost}
          disabled={submitting}
        >
          <ThemeText style={styles.addBtnText}>Post</ThemeText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.postCard,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <ThemeText style={styles.postUser}>
              {item.user?.username || "User"}
            </ThemeText>
            <ThemeText style={styles.postContent}>{item.content}</ThemeText>
            <ThemeText
              style={[styles.postDate, { color: theme.colors.textSecondary }]}
            >
              {new Date(item.created_at).toLocaleString()}
            </ThemeText>
          </View>
        )}
        ListEmptyComponent={
          <ThemeText
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No posts yet.
          </ThemeText>
        }
        refreshing={loading}
        onRefresh={fetchPosts}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  addBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  postCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  postUser: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  postContent: {
    fontSize: 15,
    marginBottom: 4,
  },
  postDate: {
    fontSize: 11,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
  },
});
