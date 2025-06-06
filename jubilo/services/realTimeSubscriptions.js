import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";

// Helper to create a subscription with retry logic
const createSubscription = (channel, table, event, handler, retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  const subscription = supabase
    .channel(channel)
    .on(
      "postgres_changes",
      { event, schema: "public", table },
      async (payload) => {
        try {
          await handler(payload);
        } catch (error) {
          console.error(`Error handling ${event} event for ${table}:`, error);
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`Successfully subscribed to ${channel}`);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        console.error(`Subscription error for ${channel}:`, status);
        if (retryCount < maxRetries) {
          console.log(`Retrying subscription to ${channel}...`);
          setTimeout(() => {
            createSubscription(channel, table, event, handler, retryCount + 1);
          }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        }
      }
    });

  return subscription;
};

// Subscribe to posts, likes, and comments
export function subscribeToPosts({ onInsert, onDelete, onLike, onComment }) {
  const subscriptions = [];

  if (onInsert) {
    subscriptions.push(
      createSubscription("posts_insert", "posts", "INSERT", async (payload) => {
        const newPost = payload.new;
        const { data: userData } = await getUserData(newPost.user_id);
        newPost.user = userData;
        onInsert(newPost);
      })
    );
  }

  if (onDelete) {
    subscriptions.push(
      createSubscription("posts_delete", "posts", "DELETE", (payload) => {
        onDelete(payload.old.id);
      })
    );
  }

  if (onLike) {
    subscriptions.push(
      createSubscription("post_likes", "post_likes", "INSERT", (payload) => {
        onLike(payload.new);
      })
    );
  }

  if (onComment) {
    subscriptions.push(
      createSubscription("comments", "comments", "INSERT", (payload) => {
        onComment(payload.new);
      })
    );
  }

  return () => {
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  };
}

// Subscribe to chat messages
export function subscribeToChatMessages(roomId, { onInsert, onDelete }) {
  const channel = `chat_messages_${roomId}`;
  const subscriptions = [];

  if (onInsert) {
    subscriptions.push(
      createSubscription(channel, "chat_messages", "INSERT", (payload) => {
        if (payload.new.room_id === roomId) {
          onInsert(payload.new);
        }
      })
    );
  }

  if (onDelete) {
    subscriptions.push(
      createSubscription(channel, "chat_messages", "DELETE", (payload) => {
        if (payload.old.room_id === roomId) {
          onDelete(payload.old.id);
        }
      })
    );
  }

  return () => {
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  };
}

// Subscribe to typing status
export function subscribeToTypingStatus(roomId, { onUpdate }) {
  const channel = `typing_status_${roomId}`;

  const subscription = createSubscription(
    channel,
    "typing_status",
    "UPDATE",
    (payload) => {
      if (payload.new.room_id === roomId) {
        onUpdate(payload.new);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}

// Subscribe to comments
export function subscribeToComments({ onInsert, onDelete }) {
  const subscriptions = [];

  if (onInsert) {
    subscriptions.push(
      createSubscription("comments_insert", "comments", "INSERT", (payload) => {
        onInsert(payload.new);
      })
    );
  }

  if (onDelete) {
    subscriptions.push(
      createSubscription("comments_delete", "comments", "DELETE", (payload) => {
        onDelete(payload.old.id);
      })
    );
  }

  return () => {
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  };
}
