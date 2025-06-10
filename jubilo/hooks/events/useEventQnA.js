import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const CACHE_KEY_PREFIX = "event_qna_";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useEventQnA(eventId) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [posting, setPosting] = useState(false);
  const [upvoted, setUpvoted] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upvoting, setUpvoting] = useState({});

  const PAGE_SIZE = 10;

  // Load from cache
  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(
        `${CACHE_KEY_PREFIX}${eventId}`
      );
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setQuestions(data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("[useEventQnA] Error loading cache:", err);
      return false;
    }
  };

  // Cache data
  const cacheData = async (data) => {
    try {
      await AsyncStorage.setItem(
        `${CACHE_KEY_PREFIX}${eventId}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (err) {
      console.error("[useEventQnA] Error caching data:", err);
    }
  };

  const fetchQuestions = useCallback(
    async (pageNum = 0, shouldRefresh = false) => {
      try {
        setError(null);
        if (pageNum === 0) {
          setLoading(true);
        }

        const start = pageNum * PAGE_SIZE;
        const end = start + PAGE_SIZE - 1;

        const { data: questionsData, error: questionsError } = await supabase
          .from("event_questions")
          .select(
            `
          *,
          user:user_id (
            id,
            username,
            image_url
          ),
          answers:event_answers (
            id,
            answer,
            created_at,
            user:user_id (
              id,
              username,
              image_url
            )
          ),
          upvotes:event_question_upvotes (
            user_id
          )
        `
          )
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .range(start, end);

        if (questionsError) throw questionsError;

        // Get upvoted questions for current user
        const { data: upvotedData, error: upvotedError } = await supabase
          .from("event_question_upvotes")
          .select("question_id")
          .eq("user_id", user.id)
          .in(
            "question_id",
            questionsData.map((q) => q.id)
          );

        if (upvotedError) throw upvotedError;

        const upvotedMap = {};
        upvotedData.forEach((upvote) => {
          upvotedMap[upvote.question_id] = true;
        });

        const processedQuestions = questionsData.map((question) => ({
          ...question,
          upvotes: question.upvotes?.length || 0,
          answers: question.answers || [],
        }));

        if (shouldRefresh) {
          setQuestions((prev) => {
            const all = [...prev, ...processedQuestions];
            const unique = [];
            const seen = new Set();
            for (const q of all) {
              if (!seen.has(q.id)) {
                unique.push(q);
                seen.add(q.id);
              }
            }
            return unique;
          });
        } else {
          setQuestions((prev) => {
            const all = [...prev, ...processedQuestions];
            const unique = [];
            const seen = new Set();
            for (const q of all) {
              if (!seen.has(q.id)) {
                unique.push(q);
                seen.add(q.id);
              }
            }
            return unique;
          });
        }

        setUpvoted((prev) => ({ ...prev, ...upvotedMap }));
        setHasMore(questionsData.length === PAGE_SIZE);
        setPage(pageNum);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId, user.id]
  );

  const postQuestion = useCallback(
    async (question) => {
      if (!user) throw new Error("You must be logged in to post a question");
      if (!question.trim()) throw new Error("Question cannot be empty");

      setPosting(true);
      try {
        const { data, error } = await supabase
          .from("event_questions")
          .insert([
            {
              event_id: eventId,
              user_id: user.id,
              question: question.trim(),
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Optimistically update the UI
        setQuestions((prev) => {
          const all = [
            ...prev,
            {
              ...data,
              user: {
                id: user.id,
                username: user.username,
                image_url: user.image_url,
              },
              upvotes: 0,
              answers: [],
            },
          ];
          const unique = [];
          const seen = new Set();
          for (const q of all) {
            if (!seen.has(q.id)) {
              unique.push(q);
              seen.add(q.id);
            }
          }
          return unique;
        });

        return data;
      } catch (err) {
        console.error("Error posting question:", err);
        throw err;
      } finally {
        setPosting(false);
      }
    },
    [eventId, user]
  );

  const postAnswer = useCallback(
    async (questionId, answer) => {
      if (!user) throw new Error("You must be logged in to post an answer");
      if (!answer.trim()) throw new Error("Answer cannot be empty");

      try {
        const { data, error } = await supabase
          .from("event_answers")
          .insert([
            {
              question_id: questionId,
              user_id: user.id,
              answer: answer.trim(),
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Optimistically update the UI
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answers: [
                    {
                      ...data,
                      user: {
                        id: user.id,
                        username: user.username,
                        image_url: user.image_url,
                      },
                    },
                    ...(q.answers || []),
                  ],
                }
              : q
          )
        );

        return data;
      } catch (err) {
        console.error("Error posting answer:", err);
        throw err;
      }
    },
    [user]
  );

  const upvoteQuestion = useCallback(
    async (questionId) => {
      if (!user) throw new Error("You must be logged in to upvote");
      if (upvoting[questionId]) return;

      setUpvoting((prev) => ({ ...prev, [questionId]: true }));
      try {
        const isUpvoted = upvoted[questionId];

        if (isUpvoted) {
          const { error } = await supabase
            .from("event_question_upvotes")
            .delete()
            .eq("question_id", questionId)
            .eq("user_id", user.id);

          if (error) throw error;

          // Optimistically update the UI
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId
                ? { ...q, upvotes: Math.max(0, (q.upvotes || 0) - 1) }
                : q
            )
          );
          setUpvoted((prev) => ({ ...prev, [questionId]: false }));
        } else {
          const { error } = await supabase
            .from("event_question_upvotes")
            .insert([
              {
                question_id: questionId,
                user_id: user.id,
              },
            ]);

          if (error) throw error;

          // Optimistically update the UI
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId ? { ...q, upvotes: (q.upvotes || 0) + 1 } : q
            )
          );
          setUpvoted((prev) => ({ ...prev, [questionId]: true }));
        }
      } catch (err) {
        console.error("Error upvoting question:", err);
        throw err;
      } finally {
        setUpvoting((prev) => ({ ...prev, [questionId]: false }));
      }
    },
    [user, upvoted, upvoting]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchQuestions(page + 1);
  }, [hasMore, loading, page, fetchQuestions]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    fetchQuestions(0, true);
  }, [fetchQuestions]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!eventId) return;

    // Subscribe to new questions
    const questionsSubscription = supabase
      .channel(`event_questions:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          // Only add if not already in the list
          setQuestions((prev) => {
            if (prev.some((q) => q.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    // Subscribe to question updates (including upvotes)
    const questionUpdatesSubscription = supabase
      .channel(`event_question_updates:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === payload.new.id ? { ...q, ...payload.new } : q
            )
          );
        }
      )
      .subscribe();

    // Subscribe to new answers
    const answersSubscription = supabase
      .channel(`event_answers:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "event_answers",
          filter: `question_id=in.(${questions.map((q) => q.id).join(",")})`,
        },
        async (payload) => {
          // Fetch the user details for the new answer
          const { data: userData } = await supabase
            .from("users")
            .select("id, username, image_url")
            .eq("id", payload.new.user_id)
            .single();

          setQuestions((prev) =>
            prev.map((q) =>
              q.id === payload.new.question_id
                ? {
                    ...q,
                    answers: [
                      {
                        ...payload.new,
                        user: userData,
                      },
                      ...(q.answers || []),
                    ],
                  }
                : q
            )
          );
        }
      )
      .subscribe();

    // Subscribe to upvote changes
    const upvotesSubscription = supabase
      .channel(`event_question_upvotes:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_question_upvotes",
          filter: `question_id=in.(${questions.map((q) => q.id).join(",")})`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === payload.new.question_id
                  ? { ...q, upvotes: (q.upvotes || 0) + 1 }
                  : q
              )
            );
            if (payload.new.user_id === user.id) {
              setUpvoted((prev) => ({
                ...prev,
                [payload.new.question_id]: true,
              }));
            }
          } else if (payload.eventType === "DELETE") {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === payload.old.question_id
                  ? { ...q, upvotes: Math.max(0, (q.upvotes || 0) - 1) }
                  : q
              )
            );
            if (payload.old.user_id === user.id) {
              setUpvoted((prev) => ({
                ...prev,
                [payload.old.question_id]: false,
              }));
            }
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchQuestions();

    return () => {
      questionsSubscription.unsubscribe();
      questionUpdatesSubscription.unsubscribe();
      answersSubscription.unsubscribe();
      upvotesSubscription.unsubscribe();
    };
  }, [eventId, user.id, questions, fetchQuestions]);

  return {
    questions,
    error,
    hasMore,
    posting,
    upvoting,
    upvoted,
    postQuestion,
    postAnswer,
    upvoteQuestion,
    loadMore,
    refresh,
  };
}
