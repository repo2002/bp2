import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const CACHE_KEY_PREFIX = "event_qna_";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 20;

export function useEventQnA(eventId) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
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
    } catch {}
  };

  // Fetch questions and answers
  const fetchQnA = useCallback(
    async (refresh = false, pageOverride = null) => {
      setLoading(true);
      setError(null);
      try {
        if (!refresh && (await loadCachedData())) return;
        const from = ((pageOverride || page) - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const {
          data,
          error: err,
          count,
        } = await supabase
          .from("event_questions")
          .select(
            `*, user:profiles(*), answers:event_answers(*, user:profiles(*))`,
            { count: "exact" }
          )
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (err) throw err;
        setQuestions(data || []);
        setHasMore((data?.length || 0) === PAGE_SIZE);
        await cacheData(data);
        // Load upvoted state from localStorage
        const upvotedRaw = await AsyncStorage.getItem(
          `event_qna_upvoted_${user?.id}_${eventId}`
        );
        setUpvoted(upvotedRaw ? JSON.parse(upvotedRaw) : {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [eventId, page, user?.id]
  );

  useEffect(() => {
    if (eventId) fetchQnA();
  }, [eventId, page]);

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
        () => fetchQnA(true)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_answers",
          filter: `event_id=eq.${eventId}`,
        },
        () => fetchQnA(true)
      )
      .subscribe();
    return () => channel.unsubscribe();
  }, [eventId, fetchQnA]);

  // Post a new question
  const postQuestion = async (question) => {
    if (!question.trim()) return;
    setPosting(true);
    try {
      const { error: err } = await supabase
        .from("event_questions")
        .insert({ event_id: eventId, user_id: user.id, question });
      if (err) throw err;
      await fetchQnA(true);
    } catch (err) {
      setError(err.message);
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
      const { error: err } = await supabase.from("event_answers").insert({
        question_id: questionId,
        user_id: user.id,
        answer,
      });
      if (err) throw err;
      await fetchQnA(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setPosting(false);
    }
  };

  // Upvote a question (client-side prevention of multiple upvotes per user)
  const upvoteQuestion = async (questionId) => {
    if (upvoted[questionId]) return; // Already upvoted
    try {
      const { error: err } = await supabase.rpc("upvote_event_question", {
        qid: questionId,
        uid: user.id,
      });
      if (err) throw err;
      const newUpvoted = { ...upvoted, [questionId]: true };
      setUpvoted(newUpvoted);
      await AsyncStorage.setItem(
        `event_qna_upvoted_${user?.id}_${eventId}`,
        JSON.stringify(newUpvoted)
      );
      await fetchQnA(true);
    } catch (err) {
      setError(err.message);
    }
  };

  // Pagination
  const loadMore = () => {
    if (hasMore && !loading) setPage((p) => p + 1);
  };

  const refresh = () => fetchQnA(true, 1);

  return {
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
  };
}
