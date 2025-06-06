import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const CACHE_KEY_PREFIX = "event_qna_";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function useEventQnA(eventId) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
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
          setLoading(false);

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

  // Fetch questions and answers
  const fetchQnA = useCallback(
    async (refresh = false) => {
      setLoading(true);
      setError(null);
      try {
        if (!refresh && (await loadCachedData())) return;
        const {
          data,
          error: err,
          count,
        } = await supabase
          .from("event_questions")
          .select(
            `*, user:profiles!event_questions_user_id_fkey(*), answers:event_answers(*, user:profiles!event_answers_user_id_fkey(*))`,
            { count: "exact" }
          )
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });
        if (err) throw err;
        setQuestions(data || []);
        await cacheData(data);
        // Load upvoted state from localStorage
        const upvotedRaw = await AsyncStorage.getItem(
          `event_qna_upvoted_${user?.id}_${eventId}`
        );
        setUpvoted(upvotedRaw ? JSON.parse(upvotedRaw) : {});
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId, user?.id]
  );

  useEffect(() => {
    if (eventId) fetchQnA();
  }, [eventId, fetchQnA]);

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
        () => {
          fetchQnA(true);
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
        () => {
          fetchQnA(true);
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [eventId, fetchQnA]);

  // Post a new question
  const postQuestion = async (question) => {
    if (!question.trim()) return;
    setPosting(true);
    try {
      const { error: err, data } = await supabase
        .from("event_questions")
        .insert({ event_id: eventId, user_id: user.id, question })
        .select(`*, user:profiles!event_questions_user_id_fkey(*)`)
        .single();
      if (err) {
        console.error("[useEventQnA] Error posting question:", err);
        throw err;
      }
      console.log("[useEventQnA] Question posted successfully:", data);
      console.log("[useEventQnA] fetchQnA called after postQuestion");
      await fetchQnA(true);
    } catch (err) {
      setError(err.message);
      console.error("[useEventQnA] postQuestion error:", err);
      throw err;
    } finally {
      setPosting(false);
    }
  };

  // Post an answer
  const postAnswer = async (questionId, answer) => {
    if (!answer.trim()) return;
    setPosting(true);
    try {
      const { error: err, data } = await supabase
        .from("event_answers")
        .insert({ question_id: questionId, user_id: user.id, answer })
        .select(`*, user:profiles!event_answers_user_id_fkey(*)`)
        .single();
      if (err) throw err;
      console.log("[useEventQnA] fetchQnA called after postAnswer");
      await fetchQnA(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setPosting(false);
    }
  };

  // Upvote a question (toggle upvote)
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
            };
          }
          return q;
        })
      );
      console.log("[useEventQnA] fetchQnA called after upvoteQuestion");
      await fetchQnA(true);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refresh = () => {
    console.log("[useEventQnA] Manual refresh triggered");
    fetchQnA(true);
  };

  return {
    questions,
    loading,
    error,
    posting,
    postQuestion,
    postAnswer,
    upvoteQuestion,
    refresh,
    upvoted,
  };
}
