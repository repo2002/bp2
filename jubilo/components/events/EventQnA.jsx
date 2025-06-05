import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useTheme } from "@/hooks/theme";
import { createEventQuestion, getEventQuestions } from "@/services/events";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventQnA({ eventId, canAsk, onQuestionAdded }) {
  const theme = useTheme();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [eventId]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEventQuestions(eventId);
      setQuestions(data || []);
    } catch (e) {
      setError(e.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!newQuestion.trim()) return;
    setPosting(true);
    try {
      await createEventQuestion(eventId, newQuestion.trim());
      setNewQuestion("");
      fetchQuestions();
      onQuestionAdded?.();
    } catch (e) {
      setError(e.message || "Failed to post question");
    } finally {
      setPosting(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.questionRow}>
      <Avatar
        uri={item.user?.image_url}
        size={32}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <ThemeText style={styles.questionText}>{item.question}</ThemeText>
        <View style={styles.metaRow}>
          <ThemeText style={styles.meta}>
            {item.user?.username} ·{" "}
            {new Date(item.created_at).toLocaleDateString()}
          </ThemeText>
          <View style={styles.statsRow}>
            <Ionicons name="arrow-up" size={16} color={theme.colors.primary} />
            <ThemeText style={styles.stat}>{item.upvotes || 0}</ThemeText>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color={theme.colors.primary}
              style={{ marginLeft: 8 }}
            />
            <ThemeText style={styles.stat}>
              {item.answers?.length || 0}
            </ThemeText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {canAsk && (
        <View style={styles.askRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
              },
            ]}
            value={newQuestion}
            onChangeText={setNewQuestion}
            placeholder="Ask a question..."
            placeholderTextColor={theme.colors.textSecondary}
            editable={!posting}
            onSubmitEditing={handleAsk}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.askBtn}
            onPress={handleAsk}
            disabled={posting || !newQuestion.trim()}
          >
            <Ionicons name="send" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 24 }}
          color={theme.colors.primary}
        />
      ) : error ? (
        <ThemeText
          style={{
            color: theme.colors.error,
            textAlign: "center",
            marginTop: 24,
          }}
        >
          {error}
        </ThemeText>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <ThemeText
              style={{
                color: theme.colors.textSecondary,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              No questions yet.
            </ThemeText>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  askRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  askBtn: {
    padding: 8,
    borderRadius: 8,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  meta: {
    fontSize: 13,
    color: "#888",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  stat: {
    fontSize: 13,
    color: "#888",
    marginLeft: 2,
  },
});
