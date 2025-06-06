import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useEventQnA } from "@/hooks/events/useEventQnA";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EventQnA({
  eventId,
  canAsk,
  canAnswer,
  onQuestionAdded,
}) {
  const theme = useTheme();
  const {
    questions,
    loading,
    error,
    hasMore,
    posting,
    postQuestion,
    postAnswer,
    upvoteQuestion,
    loadMore,
    refresh,
    upvoted,
  } = useEventQnA(eventId);
  const [expanded, setExpanded] = useState({});
  const [newQuestion, setNewQuestion] = useState("");
  const [answerInputs, setAnswerInputs] = useState({});

  const handleExpand = (questionId) => {
    setExpanded((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleAsk = async () => {
    if (!newQuestion.trim()) return;
    try {
      await postQuestion(newQuestion.trim());
      setNewQuestion("");
      onQuestionAdded?.();
    } catch (err) {
      console.error("Error posting question:", err);
    }
  };

  const handleAnswer = async (questionId) => {
    const answer = answerInputs[questionId]?.trim();
    if (!answer) return;
    try {
      await postAnswer(questionId, answer);
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      console.error("Error posting answer:", err);
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      await upvoteQuestion(questionId);
      console.log("upvoted", upvoted);
    } catch (err) {
      console.error("Error upvoting question:", err);
    }
  };

  const renderAnswer = (answer) => (
    <View key={answer.id} style={styles.answerRow}>
      <Avatar
        uri={answer.user?.image_url}
        size={28}
        style={{ marginRight: 8 }}
      />
      <View style={{ flex: 1 }}>
        <ThemeText style={styles.answerText}>{answer.answer}</ThemeText>
        <ThemeText style={styles.meta}>
          {answer.user?.username} ·{" "}
          {new Date(answer.created_at).toLocaleDateString()}
        </ThemeText>
      </View>
    </View>
  );

  const renderQuestion = ({ item }) => {
    // Find the most upvoted answer
    const mostUpvotedAnswer =
      item.answers && item.answers.length > 0
        ? [...item.answers].sort((a, b) => b.upvotes - a.upvotes)[0]
        : null;
    return (
      <View
        style={[
          styles.threadContainer,
          {
            borderBottomColor: theme.colors.text,
          },
        ]}
      >
        <View style={styles.questionRow}>
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
                <TouchableOpacity onPress={() => handleUpvote(item.id)}>
                  <Ionicons
                    name={
                      upvoted[item.id]
                        ? "arrow-up-circle"
                        : "arrow-up-circle-outline"
                    }
                    size={20}
                    color={
                      upvoted[item.id]
                        ? theme.colors.primary
                        : theme.colors.text
                    }
                  />
                </TouchableOpacity>
                <ThemeText style={{ ...styles.stat, color: theme.colors.text }}>
                  {item.upvotes || 0}
                </ThemeText>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color={theme.colors.primary}
                  style={{ marginLeft: 8 }}
                  onPress={() => handleExpand(item.id)}
                />
                <ThemeText style={styles.stat}>
                  {item.answers?.length || 0}
                </ThemeText>
              </View>
            </View>
            {mostUpvotedAnswer && !expanded[item.id] && (
              <View style={styles.mostUpvotedAnswerRow}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={theme.colors.primary}
                  style={{ marginRight: 4 }}
                />
                <ThemeText
                  style={{ color: theme.colors.text, flex: 1 }}
                  numberOfLines={1}
                >
                  {mostUpvotedAnswer.answer}
                </ThemeText>
              </View>
            )}
          </View>
          <Ionicons
            name={expanded[item.id] ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.colors.text}
            onPress={() => handleExpand(item.id)}
          />
        </View>
        {expanded[item.id] && (
          <View
            style={[
              styles.answersContainer,
              { backgroundColor: theme.colors.background },
            ]}
          >
            {item.answers && item.answers.length > 0 ? (
              item.answers.map(renderAnswer)
            ) : (
              <ThemeText style={styles.noAnswers}>No answers yet.</ThemeText>
            )}
            {canAnswer && (
              <View style={styles.answerInputRow}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      color: theme.colors.text,
                    },
                  ]}
                  value={answerInputs[item.id] || ""}
                  onChangeText={(text) =>
                    setAnswerInputs((prev) => ({ ...prev, [item.id]: text }))
                  }
                  placeholder="Write an answer..."
                  placeholderTextColor={theme.colors.textSecondary}
                  onSubmitEditing={() => handleAnswer(item.id)}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={styles.askBtn}
                  onPress={() => handleAnswer(item.id)}
                  disabled={!(answerInputs[item.id] || "").trim() || posting}
                >
                  <Ionicons
                    name="send"
                    size={22}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1 }}>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderQuestion}
          contentContainerStyle={{ paddingVertical: 8 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={refresh}
          ListEmptyComponent={
            <ThemeText
              style={{
                color: theme.colors.textSecondary,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              {loading ? "Loading..." : "No questions yet."}
            </ThemeText>
          }
        />
      </View>
      {canAsk && (
        <View
          style={[
            styles.askRow,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.text,
            },
          ]}
        >
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
            onSubmitEditing={handleAsk}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.askBtn}
            onPress={handleAsk}
            disabled={!newQuestion.trim() || posting}
          >
            <Ionicons name="send" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  askRow: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
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
  threadContainer: {
    marginBottom: 16,

    overflow: "hidden",
    borderWidth: 0.5,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginBottom: 4,
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
  answersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 2,
  },
  answerText: {
    fontSize: 15,
    marginBottom: 2,
  },
  noAnswers: {
    color: "#aaa",
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 8,
  },
  answerInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  mostUpvotedAnswerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 2,
    marginLeft: 0,
  },
});
