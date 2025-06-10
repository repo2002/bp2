import { supabase } from "@/lib/supabase";
import { create } from "zustand";

const useEventStore = create((set, get) => ({
  events: new Map(),
  participants: new Map(),
  questions: new Map(),
  answers: new Map(),
  followers: new Map(),
  images: new Map(),
  posts: new Map(),

  // Event actions
  setEvent: (id, data) =>
    set((state) => ({
      events: new Map(state.events).set(id, data),
    })),

  updateEvent: (id, updates) =>
    set((state) => {
      const currentEvent = state.events.get(id);
      if (!currentEvent) return state;
      return {
        events: new Map(state.events).set(id, { ...currentEvent, ...updates }),
      };
    }),

  // Participant actions
  setParticipants: (eventId, participants) =>
    set((state) => ({
      participants: new Map(state.participants).set(eventId, participants),
    })),

  addParticipant: (eventId, participant) =>
    set((state) => {
      const currentParticipants = state.participants.get(eventId) || [];
      return {
        participants: new Map(state.participants).set(eventId, [
          ...currentParticipants,
          participant,
        ]),
      };
    }),

  removeParticipant: (eventId, userId) =>
    set((state) => {
      const currentParticipants = state.participants.get(eventId) || [];
      return {
        participants: new Map(state.participants).set(
          eventId,
          currentParticipants.filter((p) => p.user_id !== userId)
        ),
      };
    }),

  // Question actions
  setQuestions: (eventId, questions) =>
    set((state) => ({
      questions: new Map(state.questions).set(eventId, questions),
    })),

  addQuestion: (eventId, question) =>
    set((state) => {
      const currentQuestions = state.questions.get(eventId) || [];
      return {
        questions: new Map(state.questions).set(eventId, [
          ...currentQuestions,
          question,
        ]),
      };
    }),

  updateQuestion: (eventId, questionId, updates) =>
    set((state) => {
      const currentQuestions = state.questions.get(eventId) || [];
      return {
        questions: new Map(state.questions).set(
          eventId,
          currentQuestions.map((q) =>
            q.id === questionId ? { ...q, ...updates } : q
          )
        ),
      };
    }),

  // Answer actions
  setAnswers: (questionId, answers) =>
    set((state) => ({
      answers: new Map(state.answers).set(questionId, answers),
    })),

  addAnswer: (questionId, answer) =>
    set((state) => {
      const currentAnswers = state.answers.get(questionId) || [];
      return {
        answers: new Map(state.answers).set(questionId, [
          ...currentAnswers,
          answer,
        ]),
      };
    }),

  // Follower actions
  setFollowers: (eventId, followers) =>
    set((state) => ({
      followers: new Map(state.followers).set(eventId, followers),
    })),

  addFollower: (eventId, follower) =>
    set((state) => {
      const currentFollowers = state.followers.get(eventId) || [];
      return {
        followers: new Map(state.followers).set(eventId, [
          ...currentFollowers,
          follower,
        ]),
      };
    }),

  removeFollower: (eventId, userId) =>
    set((state) => {
      const currentFollowers = state.followers.get(eventId) || [];
      return {
        followers: new Map(state.followers).set(
          eventId,
          currentFollowers.filter((f) => f.user_id !== userId)
        ),
      };
    }),

  // Image actions
  setImages: (eventId, images) =>
    set((state) => ({
      images: new Map(state.images).set(eventId, images),
    })),

  addImage: (eventId, image) =>
    set((state) => {
      const currentImages = state.images.get(eventId) || [];
      return {
        images: new Map(state.images).set(eventId, [...currentImages, image]),
      };
    }),

  removeImage: (eventId, imageId) =>
    set((state) => {
      const currentImages = state.images.get(eventId) || [];
      return {
        images: new Map(state.images).set(
          eventId,
          currentImages.filter((img) => img.id !== imageId)
        ),
      };
    }),

  // Post actions
  setPosts: (eventId, posts) =>
    set((state) => ({
      posts: new Map(state.posts).set(eventId, posts),
    })),

  addPost: (eventId, post) =>
    set((state) => {
      const currentPosts = state.posts.get(eventId) || [];
      return {
        posts: new Map(state.posts).set(eventId, [...currentPosts, post]),
      };
    }),

  // Real-time subscription helpers
  subscribeToEvent: (eventId) => {
    const channel = supabase
      .channel(`event:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          get().setEvent(eventId, payload.new);
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  },

  subscribeToParticipants: (eventId) => {
    const channel = supabase
      .channel(`event_participants:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            get().addParticipant(eventId, payload.new);
          } else if (payload.eventType === "DELETE") {
            get().removeParticipant(eventId, payload.old.user_id);
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  },

  subscribeToQuestions: (eventId) => {
    const channel = supabase
      .channel(`event_questions:${eventId}`)
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
            get().addQuestion(eventId, payload.new);
          } else if (payload.eventType === "UPDATE") {
            get().updateQuestion(eventId, payload.new.id, payload.new);
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  },

  subscribeToAnswers: (questionId) => {
    const channel = supabase
      .channel(`event_answers:${questionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_answers",
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            get().addAnswer(questionId, payload.new);
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  },

  subscribeToFollowers: (eventId) => {
    const channel = supabase
      .channel(`event_followers:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_followers",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            get().addFollower(eventId, payload.new);
          } else if (payload.eventType === "DELETE") {
            get().removeFollower(eventId, payload.old.user_id);
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  },

  subscribeToPosts: (eventId) => {
    const channel = supabase
      .channel(`event_posts:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_posts",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            get().addPost(eventId, payload.new);
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  },
}));

export default useEventStore;
