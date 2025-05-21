import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  //users table
  users: defineTable({
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    username: v.string(),
    firstname: v.string(),
    lastname: v.string(),
    dateOfBirth: v.optional(v.number()),
    phoneNumber: v.string(),
    lastSeen: v.optional(v.number()),
    isOnline: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
    followers: v.optional(v.array(v.id("users"))),
    following: v.optional(v.array(v.id("users"))),
    bio: v.optional(v.string()),
    clerkId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isPrivate: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    isSuspended: v.optional(v.boolean()),
    preferences: v.optional(v.any()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_phoneNumber", ["phoneNumber"])
    .index("by_firstname", ["firstname"])
    .index("by_lastname", ["lastname"])
    .index("by_email", ["email"]),

  // Posts
  posts: defineTable({
    userId: v.id("users"),
    content: v.optional(v.string()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          metadata: v.optional(v.any()),
        })
      )
    ),
    location: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Comments
  comments: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    parentId: v.optional(v.id("comments")),
    content: v.string(),
    createdAt: v.number(),
  }),

  // Likes
  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  // Events
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    location: v.string(),
    dressCode: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),
    startTime: v.number(),
    endTime: v.number(),
    isPrivate: v.optional(v.boolean()),
    createdBy: v.id("users"),
    invites: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          status: v.union(
            v.literal("pending"),
            v.literal("accepted"),
            v.literal("declined")
          ),
        })
      )
    ),
    rsvpDeadline: v.optional(v.number()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          metadata: v.optional(v.any()),
        })
      )
    ),
    groupChatId: v.optional(v.id("chats")),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  // event questions
  eventQuestions: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    title: v.string(),
    content: v.optional(v.string()),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          metadata: v.optional(v.any()),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_event", ["eventId"]),

  // Event Answers
  eventAnswers: defineTable({
    questionId: v.id("eventQuestions"),
    userId: v.id("users"),
    content: v.string(),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          metadata: v.optional(v.any()),
        })
      )
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_question", ["questionId"]),

  // Carpools
  carpools: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startLocation: v.string(),
    endLocation: v.string(),
    departureTime: v.number(),
    isRecurring: v.optional(v.boolean()),
    recurringPattern: v.optional(v.string()), // e.g., "Mon-Fri", "weekly"
    seatsAvailable: v.optional(v.number()),
    driverId: v.id("users"),
    passengers: v.optional(v.array(v.id("users"))),
    createdAt: v.number(),
    tip: v.optional(v.number()),
  }).index("by_driver", ["driverId"]),

  //chats table
  chats: defineTable({
    name: v.string(),
    members: v.array(v.id("users")),
    lastMessage: v.optional(v.string()),
    lastMessageSender: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    lastMessageType: v.optional(v.string()),
    lastMessageStatus: v.optional(v.string()),
    isGroup: v.optional(v.boolean()),
    groupName: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    groupDescription: v.optional(v.string()),
    groupAdmins: v.optional(v.array(v.id("users"))),
    groupCreatedAt: v.optional(v.number()),
    groupUpdatedAt: v.optional(v.number()),
    groupCreatedBy: v.id("users"),
    combinedMemberKey: v.optional(v.string()),
    unreadCounts: v.optional(v.array(v.object({
      userId: v.id("users"),
      count: v.number()
    }))),
  })
    .index("by_members", ["members"])
    .index("by_lastMessage", ["lastMessage"])
    .index("by_lastMessageSender", ["lastMessageSender"])
    .index("by_lastMessageTime", ["lastMessageTime"]),

  //    Follows table
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"))),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"]),

  //messages table
  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    message: v.string(),
    media: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          type: v.string(),
          metadata: v.optional(v.any()),
        })
      )
    ),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("file"),
      v.literal("location"),
      v.literal("todo"),
      v.literal("link"),
      v.literal("internal"),
      v.literal("sticker"),
      v.literal("poll"),
      v.literal("contact"),
      v.literal("reaction"),
      v.literal("gif")
    ),
    metadata: v.optional(v.any()),
    messageTime: v.number(),
    messageId: v.string(),
    replyToId: v.optional(v.string()),
    isEdited: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
    isPinned: v.optional(v.boolean()),
    isForwarded: v.optional(v.boolean()),
    isSeen: v.optional(v.boolean()),
    isDelivered: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chat_and_messageTime", ["chatId", "messageTime"])
    .index("by_sender", ["senderId"])
    .index("by_messageId", ["messageId"]),

  //message status table
  messageStatus: defineTable({
    messageId: v.id("messages"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    isSent: v.boolean(),
    isDelivered: v.boolean(),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_senderId", ["senderId"]), // Notifications

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("message"),
      v.literal("follow"),
      v.literal("mention"),
      v.literal("event_invite"),
      v.literal("event_update"),
      v.literal("post_like"),
      v.literal("post_comment"),
      v.literal("carpool_invite")
    ),
    data: v.any(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
