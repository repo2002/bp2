import Avatar from "@/components/Avatar";
import ThemeText from "@/components/theme/ThemeText";
import { useEventQnA } from "@/hooks/events/useEventQnA";
import { useTheme } from "@/hooks/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SORT_OPTIONS = [
  { label: "Most Upvoted", value: "upvotes" },
  { label: "Most Recent", value: "recent" },
  { label: "Most Answered", value: "answers" },
];

export default function EventQnA({
  eventId,
  canAsk,
  canAnswer,
  onQuestionAdded,
}) {
  const theme = useTheme();
  const {
    questions,
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
  const [sortBy, setSortBy] = useState("upvotes");
  const [upvoting, setUpvoting] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);

  const handleExpand = useCallback((questionId) => {
    setExpanded((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const handleAsk = async () => {
    if (!newQuestion.trim()) return;
    setErrorMessage(null);
    try {
      await postQuestion(newQuestion.trim());
      setNewQuestion("");
      onQuestionAdded?.();
    } catch (err) {
      setErrorMessage(err.message || "Failed to post question");
    }
  };

  const handleAnswer = async (questionId) => {
    const answer = answerInputs[questionId]?.trim();
    if (!answer) return;
    setErrorMessage(null);
    try {
      await postAnswer(questionId, answer);
      setAnswerInputs((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      setErrorMessage(err.message || "Failed to post answer");
    }
  };

  const handleUpvote = async (questionId) => {
    if (upvoting[questionId]) return;
    setUpvoting((prev) => ({ ...prev, [questionId]: true }));
    try {
      await upvoteQuestion(questionId);
    } catch (err) {
      setErrorMessage(err.message || "Failed to upvote");
    } finally {
      setUpvoting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const renderAnswer = useCallback(
    (answer) => (
      <View key={`answer-${answer.id}`} style={styles.answerRow}>
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
    ),
    []
  );

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      switch (sortBy) {
        case "upvotes":
          return (b.upvotes || 0) - (a.upvotes || 0);
        case "recent":
          return new Date(b.created_at) - new Date(a.created_at);
        case "answers":
          return (b.answers?.length || 0) - (a.answers?.length || 0);
        default:
          return 0;
      }
    });
  }, [questions, sortBy]);

  const renderQuestion = useCallback(
    ({ item }) => {
      const isMostUpvoted =
        sortBy === "upvotes" &&
        item.upvotes > 0 &&
        sortedQuestions[0]?.id === item.id;
      const isMostAnswered =
        sortBy === "answers" &&
        item.answers?.length > 0 &&
        sortedQuestions[0]?.id === item.id;
      const isMostRecent =
        sortBy === "recent" && sortedQuestions[0]?.id === item.id;

      return (
        <View
          key={`question-${item.id}`}
          style={[
            styles.threadContainer,
            {
              borderBottomColor: theme.colors.text,
              backgroundColor:
                isMostUpvoted || isMostAnswered || isMostRecent
                  ? theme.colors.cardBackground
                  : undefined,
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
                  <TouchableOpacity
                    key={`upvote-${item.id}`}
                    onPress={() => handleUpvote(item.id)}
                    disabled={upvoting[item.id]}
                    style={{ padding: 4 }}
                  >
                    {upvoting[item.id] ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                    ) : (
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
                    )}
                  </TouchableOpacity>
                  <ThemeText
                    style={[
                      styles.stat,
                      {
                        color: upvoted[item.id]
                          ? theme.colors.primary
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {item.upvotes || 0}
                  </ThemeText>
                  <TouchableOpacity
                    key={`expand-${item.id}`}
                    onPress={() => handleExpand(item.id)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={16}
                      color={theme.colors.primary}
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                  <ThemeText style={styles.stat}>
                    {item.answers?.length || 0}
                  </ThemeText>
                </View>
              </View>
              {item.answers?.length > 0 && !expanded[item.id] && (
                <View
                  key={`preview-${item.id}`}
                  style={styles.mostUpvotedAnswerRow}
                >
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
                    {item.answers[0].answer}
                  </ThemeText>
                </View>
              )}
            </View>
            <TouchableOpacity
              key={`expand-button-${item.id}`}
              onPress={() => handleExpand(item.id)}
              style={{ padding: 4 }}
            >
              <Ionicons
                name={expanded[item.id] ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
          {expanded[item.id] && (
            <View
              key={`answers-${item.id}`}
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
                <View
                  key={`answer-input-${item.id}`}
                  style={styles.answerInputRow}
                >
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
                    key={`send-${item.id}`}
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
    },
    [
      theme,
      sortBy,
      sortedQuestions,
      upvoting,
      upvoted,
      expanded,
      answerInputs,
      posting,
      canAnswer,
    ]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1 }}>
        {errorMessage && (
          <ThemeText
            style={[styles.errorMessage, { color: theme.colors.error }]}
          >
            {errorMessage}
          </ThemeText>
        )}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={`sort-${option.value}`}
              style={[
                styles.sortButton,
                {
                  backgroundColor:
                    sortBy === option.value
                      ? theme.colors.primary
                      : theme.colors.cardBackground,
                },
              ]}
              onPress={() => setSortBy(option.value)}
            >
              <ThemeText
                style={[
                  styles.sortButtonText,
                  {
                    color: sortBy === option.value ? "#fff" : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </ThemeText>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={sortedQuestions}
          keyExtractor={(item) => `question-list-${item.id}`}
          renderItem={renderQuestion}
          contentContainerStyle={{ paddingVertical: 8 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={false}
          onRefresh={refresh}
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
  errorMessage: {
    textAlign: "center",
    padding: 8,
    marginBottom: 8,
  },
  sortRow: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
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
    borderRadius: 8,
    marginHorizontal: 8,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
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
  },
  stat: {
    fontSize: 13,
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
  },
});
