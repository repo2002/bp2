import { Id } from "./convex/_generated/dataModel";


// Dummy users (we'll reference these in chats)
const users = {
  user1: "user1" as Id<"users">,
  user2: "user2" as Id<"users">,
  user3: "user3" as Id<"users">,
  user4: "user4" as Id<"users">,
  user5: "user5" as Id<"users">,
};

// Current timestamp
const now = Date.now();

// 1-1 Chats
export const oneOnOneChats = [
  {
    _id: "chat1" as Id<"chats">,
    name: "Direct Chat",
    members: [users.user1, users.user2],
    lastMessage: "Hey, how are you?",
    lastMessageSender: users.user1,
    lastMessageTime: now - 1000 * 60 * 5, // 5 minutes ago
    lastMessageType: "text",
    lastMessageStatus: "delivered",
    isGroup: false,
    groupCreatedBy: users.user1,
    combinedMemberKey: `${users.user1}_${users.user2}`,
  },
  {
    _id: "chat2" as Id<"chats">,
    name: "Direct Chat",
    members: [users.user1, users.user3],
    lastMessage: "See you tomorrow!",
    lastMessageSender: users.user3,
    lastMessageTime: now - 1000000 * 60 * 30, // 30 minutes ago
    lastMessageType: "text",
    lastMessageStatus: "read",
    isGroup: false,
    groupCreatedBy: users.user1,
    combinedMemberKey: `${users.user1}_${users.user3}`,
  },
  {
    _id: "chat3" as Id<"chats">,
    name: "Direct Chat",
    members: [users.user2, users.user3],
    lastMessage: "Thanks for the help!",
    lastMessageSender: users.user2,
    lastMessageTime: now - 1000 * 60 * 60, // 1 hour ago
    lastMessageType: "text",
    lastMessageStatus: "unread",
    unreadCount: [
      {
        userId: users.user1,
        count: 3
      }
    ],
    isGroup: false,
    groupCreatedBy: users.user2,
    combinedMemberKey: `${users.user2}_${users.user3}`,
  },
];

// Group Chats
export const groupChats = [
  {
    _id: "group1" as Id<"chats">,
    name: "Group Chat",
    members: [users.user1, users.user2, users.user3],
    lastMessage: "Meeting at 3 PM",
    lastMessageSender: users.user1,
    lastMessageTime: now - 1000 * 60 * 15, // 15 minutes ago
    lastMessageType: "text",
    lastMessageStatus: "delivered",
    isGroup: true,
    groupName: "Project Team",
    groupDescription: "Team chat for project coordination",
    groupAdmins: [users.user1],
    groupCreatedAt: now - 1000 * 60 * 60 * 24 * 7, // 1 week ago
    groupUpdatedAt: now - 1000 * 60 * 60, // 1 hour ago
    groupCreatedBy: users.user1,
    unreadCounts: [
      {
        userId: users.user1,
        count: 5
      }
    ],
  },
  {
    _id: "group2" as Id<"chats">,
    name: "Group Chat",
    members: [users.user2, users.user3, users.user4],
    lastMessage: "Who's bringing snacks?",
    lastMessageSender: users.user4,
    lastMessageTime: now - 1000 * 60 * 45, // 45 minutes ago
    lastMessageType: "text",
    lastMessageStatus: "read",
    isGroup: true,
    groupName: "Party Planning",
    groupDescription: "Planning the weekend party",
    groupAdmins: [users.user2],
    groupCreatedAt: now - 1000 * 60 * 60 * 24 * 3, // 3 days ago
    groupUpdatedAt: now - 1000 * 60 * 30, // 30 minutes ago
    groupCreatedBy: users.user2,
  },
  {
    _id: "group3" as Id<"chats">,
    name: "Group Chat",
    members: [users.user1, users.user3, users.user5],
    lastMessage: "New event details attached",
    lastMessageSender: users.user5,
    lastMessageTime: now - 1000 * 60 * 20, // 20 minutes ago
    lastMessageType: "text",
    lastMessageStatus: "delivered",
    isGroup: true,
    groupName: "Event Organizers",
    groupDescription: "Coordination for upcoming events",
    groupAdmins: [users.user1, users.user5],
    groupCreatedAt: now - 1000 * 60 * 60 * 24 * 14, // 2 weeks ago
    groupUpdatedAt: now - 1000 * 60 * 10, // 10 minutes ago
    groupCreatedBy: users.user1,
  },
];

// Messages for 1-1 chats
export const oneOnOneMessages = [
  // Chat 1 messages
  {
    _id: "msg1" as Id<"messages">,
    chatId: "chat1" as Id<"chats">,
    senderId: users.user1,
    message: "Hey, how are you?",
    messageType: "text",
    messageTime: now - 1000 * 60 * 5,
    messageId: "msg1",
    isSeen: true,
    isDelivered: true,
    createdAt: now - 1000 * 60 * 5,
    updatedAt: now - 1000 * 60 * 5,
  },
  {
    _id: "msg2" as Id<"messages">,
    chatId: "chat1" as Id<"chats">,
    senderId: users.user2,
    message: "I'm good, thanks! How about you?",
    messageType: "text",
    messageTime: now - 1000 * 60 * 4,
    messageId: "msg2",
    isSeen: true,
    isDelivered: true,
    createdAt: now - 1000 * 60 * 4,
    updatedAt: now - 1000 * 60 * 4,
  },
  {
    _id: "msg3" as Id<"messages">,
    chatId: "chat1" as Id<"chats">,
    senderId: users.user1,
    message: "Check out this photo!",
    messageType: "image",
    messageTime: now - 1000 * 60 * 3,
    messageId: "msg3",
    isSeen: true,
    isDelivered: true,
    media: [
      {
        storageId: "https://picsum.photos/400/300",
        type: "image/jpeg",
      },
    ],
    createdAt: now - 1000 * 60 * 3,
    updatedAt: now - 1000 * 60 * 3,
  },
  {
    _id: "msg4" as Id<"messages">,
    chatId: "chat1" as Id<"chats">,
    senderId: users.user2,
    message: "Nice photo! Here's a video I took",
    messageType: "video",
    messageTime: now - 1000 * 60 * 2,
    messageId: "msg4",
    isSeen: false,
    isDelivered: true,
    media: [
      {
        storageId: "https://example.com/video.mp4",
        type: "video/mp4",
        metadata: {
          thumbnail: "https://picsum.photos/400/300",
          duration: 30,
        },
      },
    ],
    createdAt: now - 1000 * 60 * 2,
    updatedAt: now - 1000 * 60 * 2,
  },
  {
    _id: "msg5" as Id<"messages">,
    chatId: "chat1" as Id<"chats">,
    senderId: users.user1,
    message: "Here's a voice message",
    messageType: "audio",
    messageTime: now - 1000 * 60 * 1,
    messageId: "msg5",
    isSeen: false,
    isDelivered: true,
    media: [
      {
        storageId: "https://example.com/audio.mp3",
        type: "audio/mp3",
        metadata: {
          duration: 15,
        },
      },
    ],
    createdAt: now - 1000 * 60 * 1,
    updatedAt: now - 1000 * 60 * 1,
  },
  // Chat 2 messages
  {
    _id: "msg6" as Id<"messages">,
    chatId: "chat2" as Id<"chats">,
    senderId: users.user3,
    message: "See you tomorrow!",
    messageType: "text",
    messageTime: now - 1000 * 60 * 30,
    messageId: "msg6",
    isSeen: true,
    isDelivered: true,
    createdAt: now - 1000 * 60 * 30,
    updatedAt: now - 1000 * 60 * 30,
  },
  {
    _id: "msg7" as Id<"messages">,
    chatId: "chat2" as Id<"chats">,
    senderId: users.user1,
    message: "Let's meet at this location",
    messageType: "location",
    messageTime: now - 1000 * 60 * 25,
    messageId: "msg7",
    isSeen: true,
    isDelivered: true,
    metadata: {
      latitude: 37.7749,
      longitude: -122.4194,
      name: "Coffee Shop",
    },
    createdAt: now - 1000 * 60 * 25,
    updatedAt: now - 1000 * 60 * 25,
  },
  {
    _id: "msg8" as Id<"messages">,
    chatId: "chat2" as Id<"chats">,
    senderId: users.user3,
    message: "Here's the document",
    messageType: "file",
    messageTime: now - 1000 * 60 * 20,
    messageId: "msg8",
    isSeen: true,
    isDelivered: true,
    media: [
      {
        storageId: "https://example.com/document.pdf",
        type: "application/pdf",
        metadata: {
          fileName: "document.pdf",
          fileSize: 1024 * 1024, // 1MB
        },
      },
    ],
    createdAt: now - 1000 * 60 * 20,
    updatedAt: now - 1000 * 60 * 20,
  },
];

// Messages for group chats
export const groupMessages = [
  // Group 1 messages
  {
    _id: "gmsg1" as Id<"messages">,
    chatId: "group1" as Id<"chats">,
    senderId: users.user1,
    message: "Meeting at 3 PM",
    messageType: "text",
    messageTime: now - 1000 * 60 * 15,
    messageId: "gmsg1",
    isSeen: true,
    isDelivered: true,
    createdAt: now - 1000 * 60 * 15,
    updatedAt: now - 1000 * 60 * 15,
  },
  {
    _id: "gmsg2" as Id<"messages">,
    chatId: "group1" as Id<"chats">,
    senderId: users.user2,
    message: "I'll be there",
    messageType: "text",
    messageTime: now - 1000 * 60 * 14,
    messageId: "gmsg2",
    isSeen: true,
    isDelivered: true,
    createdAt: now - 1000 * 60 * 14,
    updatedAt: now - 1000 * 60 * 14,
  },
  {
    _id: "gmsg3" as Id<"messages">,
    chatId: "group1" as Id<"chats">,
    senderId: users.user1,
    message: "Let's vote on the meeting time",
    messageType: "poll",
    messageTime: now - 1000 * 60 * 13,
    messageId: "gmsg3",
    isSeen: true,
    isDelivered: true,
    metadata: {
      question: "When should we meet?",
      options: ["2 PM", "3 PM", "4 PM"],
      votes: {
        "2 PM": [users.user2],
        "3 PM": [users.user1, users.user3],
        "4 PM": [],
      },
    },
    createdAt: now - 1000 * 60 * 13,
    updatedAt: now - 1000 * 60 * 13,
  },
  {
    _id: "gmsg4" as Id<"messages">,
    chatId: "group1" as Id<"chats">,
    senderId: users.user3,
    message: "Here's the checklist for the meeting",
    messageType: "todo",
    messageTime: now - 1000 * 60 * 12,
    messageId: "gmsg4",
    isSeen: true,
    isDelivered: true,
    metadata: {
      items: [
        { text: "Prepare presentation", completed: true },
        { text: "Book meeting room", completed: false },
        { text: "Send agenda", completed: false },
      ],
    },
    createdAt: now - 1000 * 60 * 12,
    updatedAt: now - 1000 * 60 * 12,
  },
  // Group 2 messages
  {
    _id: "gmsg5" as Id<"messages">,
    chatId: "group2" as Id<"chats">,
    senderId: users.user4,
    message: "Who's bringing snacks?",
    messageType: "text",
    messageTime: now - 1000 * 60 * 45,
    messageId: "gmsg5",
    isSeen: true,
    isDelivered: true,
    createdAt: now - 1000 * 60 * 45,
    updatedAt: now - 1000 * 60 * 45,
  },
  {
    _id: "gmsg6" as Id<"messages">,
    chatId: "group2" as Id<"chats">,
    senderId: users.user3,
    message: "I can bring drinks",
    messageType: "text",
    messageTime: now - 1000 * 60 * 44,
    messageId: "gmsg6",
    isSeen: true,
    isDelivered: true,
    createdAt: now - 1000 * 60 * 44,
    updatedAt: now - 1000 * 60 * 44,
  },
  {
    _id: "gmsg7" as Id<"messages">,
    chatId: "group2" as Id<"chats">,
    senderId: users.user2,
    message: "Here's my contact info",
    messageType: "contact",
    messageTime: now - 1000 * 60 * 43,
    messageId: "gmsg7",
    isSeen: true,
    isDelivered: true,
    metadata: {
      name: "John Doe",
      phone: "+1234567890",
      email: "john@example.com",
    },
    createdAt: now - 1000 * 60 * 43,
    updatedAt: now - 1000 * 60 * 43,
  },
];

// Combine all chats and messages
export const allChats = [...oneOnOneChats, ...groupChats];
export const allMessages = [...oneOnOneMessages, ...groupMessages];
