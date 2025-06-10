import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const CACHE_KEY_PREFIX = "event_qna_";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useEventQnA(eventId) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [upvoted, setUpvoted] = useState({}); // { [questionId]: true }

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

  // Initial data fetch
  useEffect(() => {
    if (!eventId) return;

    const fetchInitialData = async () => {
      try {
        if (await loadCachedData()) return;

        const { data, error: err } = await supabase
          .from("event_questions")
          .select(
            `*, 
            user:profiles!event_questions_user_id_fkey(*), 
            answers:event_answers(*, user:profiles!event_answers_user_id_fkey(*)),
            upvotes:event_question_upvotes(user_id)`
          )
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });

        if (err) throw err;

        // Process upvotes
        const processedData = data.map((q) => ({
          ...q,
          upvotes: q.upvotes?.length || 0,
          hasUpvoted: q.upvotes?.some((u) => u.user_id === user?.id) || false,
        }));

        setQuestions(processedData);
        await cacheData(processedData);

        // Load upvoted state
        const upvotedRaw = await AsyncStorage.getItem(
          `event_qna_upvoted_${user?.id}_${eventId}`
        );
        setUpvoted(upvotedRaw ? JSON.parse(upvotedRaw) : {});
      } catch (err) {
        setError(err.message);
      }
    };

    fetchInitialData();
  }, [eventId, user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`event_qna:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the full question data with upvotes
            supabase
              .from("event_questions")
              .select(
                `*, 
                user:profiles!event_questions_user_id_fkey(*), 
                answers:event_answers(*, user:profiles!event_answers_user_id_fkey(*)),
                upvotes:event_question_upvotes(user_id)`
              )
              .eq("id", payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  const processedData = {
                    ...data,
                    upvotes: data.upvotes?.length || 0,
                    hasUpvoted:
                      data.upvotes?.some((u) => u.user_id === user?.id) ||
                      false,
                  };
                  setQuestions((prev) => [processedData, ...prev]);
                }
              });
          } else if (payload.eventType === "DELETE") {
            setQuestions((prev) => prev.filter((q) => q.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setQuestions((prev) =>
              prev.map((q) =>
                q.id === payload.new.id ? { ...q, ...payload.new } : q
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_answers",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the full answer data
            supabase
              .from("event_answers")
              .select(`*, user:profiles!event_answers_user_id_fkey(*)`)
              .eq("id", payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setQuestions((prev) =>
                    prev.map((q) => {
                      if (q.id === data.question_id) {
                        return {
                          ...q,
                          answers: [...(q.answers || []), data],
                        };
                      }
                      return q;
                    })
                  );
                }
              });
          } else if (payload.eventType === "DELETE") {
            setQuestions((prev) =>
              prev.map((q) => {
                if (q.id === payload.old.question_id) {
                  return {
                    ...q,
                    answers: (q.answers || []).filter(
                      (a) => a.id !== payload.old.id
                    ),
                  };
                }
                return q;
              })
            );
          } else if (payload.eventType === "UPDATE") {
            setQuestions((prev) =>
              prev.map((q) => {
                if (q.id === payload.new.question_id) {
                  return {
                    ...q,
                    answers: (q.answers || []).map((a) =>
                      a.id === payload.new.id ? payload.new : a
                    ),
                  };
                }
                return q;
              })
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_question_upvotes",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setQuestions((prev) =>
              prev.map((q) => {
                if (q.id === payload.new.question_id) {
                  return {
                    ...q,
                    upvotes: (q.upvotes || 0) + 1,
                    hasUpvoted:
                      payload.new.user_id === user?.id ? true : q.hasUpvoted,
                  };
                }
                return q;
              })
            );
          } else if (payload.eventType === "DELETE") {
            setQuestions((prev) =>
              prev.map((q) => {
                if (q.id === payload.old.question_id) {
                  return {
                    ...q,
                    upvotes: (q.upvotes || 0) - 1,
                    hasUpvoted:
                      payload.old.user_id === user?.id ? false : q.hasUpvoted,
                  };
                }
                return q;
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId, user?.id]);

  // Post a new question
  const postQuestion = async (question) => {
    try {
      const { data, error: err } = await supabase
        .from("event_questions")
        .insert({
          event_id: eventId,
          question,
          user_id: user.id,
        })
        .select(
          `
          *,
          user:profiles!event_questions_user_id_fkey(*)
        `
        )
        .single();

      if (err) throw err;

      // Update state directly
      setQuestions((prev) => [
        {
          ...data,
          upvotes: 0,
          hasUpvoted: false,
          answers: [],
        },
        ...prev,
      ]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Post an answer
  const postAnswer = async (questionId, answer) => {
    try {
      const { data, error: err } = await supabase
        .from("event_answers")
        .insert({
          question_id: questionId,
          answer,
          user_id: user.id,
        })
        .select(
          `
          *,
          user:profiles!event_answers_user_id_fkey(*)
        `
        )
        .single();

      if (err) throw err;

      // Update state directly
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              answers: [...(q.answers || []), data],
            };
          }
          return q;
        })
      );

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Upvote a question
  const upvoteQuestion = async (questionId) => {
    try {
      const { data: result, error: err } = await supabase.rpc(
        "upvote_event_question",
        {
          qid: questionId,
          uid: user.id,
        }
      );
      if (err) throw err;

      // Update local state
      const newUpvoted = { ...upvoted, [questionId]: result.upvoted };
      setUpvoted(newUpvoted);
      await AsyncStorage.setItem(
        `event_qna_upvoted_${user?.id}_${eventId}`,
        JSON.stringify(newUpvoted)
      );

      // Update questions list with new upvote count
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id === questionId) {
            return {
              ...q,
              upvotes:
                result.action === "added"
                  ? (q.upvotes || 0) + 1
                  : (q.upvotes || 0) - 1,
              hasUpvoted: result.action === "added",
            };
          }
          return q;
        })
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    questions,
    error,
    postQuestion,
    postAnswer,
    upvoteQuestion,
    upvoted,
  };
}
