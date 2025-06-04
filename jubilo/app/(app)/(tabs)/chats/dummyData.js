// Dummy data for chats based on your Supabase schema

export const chatRooms = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "General Chat",
    is_group: true,
    max_participants: 25,
    created_by: "user-1-uuid",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Private Chat",
    is_group: false,
    max_participants: 2,
    created_by: "user-2-uuid",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Project Team",
    is_group: true,
    max_participants: 10,
    created_by: "user-3-uuid",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

export const chatParticipants = [
  // General Chat
  {
    id: "p-1",
    room_id: "11111111-1111-1111-1111-111111111111",
    user_id: "user-1-uuid",
    role: "admin",
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "p-2",
    room_id: "11111111-1111-1111-1111-111111111111",
    user_id: "user-2-uuid",
    role: "member",
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
  },
  // Private Chat
  {
    id: "p-3",
    room_id: "22222222-2222-2222-2222-222222222222",
    user_id: "user-2-uuid",
    role: "admin",
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "p-4",
    room_id: "22222222-2222-2222-2222-222222222222",
    user_id: "user-3-uuid",
    role: "member",
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
  },
  // Project Team
  {
    id: "p-5",
    room_id: "33333333-3333-3333-3333-333333333333",
    user_id: "user-3-uuid",
    role: "admin",
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "p-6",
    room_id: "33333333-3333-3333-3333-333333333333",
    user_id: "user-1-uuid",
    role: "member",
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
  },
  {
    id: "p-7",
    room_id: "33333333-3333-3333-3333-333333333333",
    user_id: "user-2-uuid",
    role: "member",
    joined_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
  },
];

export const chatMessages = [
  // General Chat
  {
    id: "m-1",
    room_id: "11111111-1111-1111-1111-111111111111",
    sender_id: "user-1-uuid",
    type: "text",
    content: "Welcome to the General Chat!",
    metadata: null,
    reply_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "m-2",
    room_id: "11111111-1111-1111-1111-111111111111",
    sender_id: "user-2-uuid",
    type: "text",
    content: "Hi everyone!",
    metadata: { mood: "happy" },
    reply_to: "m-1",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  // Private Chat
  {
    id: "m-3",
    room_id: "22222222-2222-2222-2222-222222222222",
    sender_id: "user-2-uuid",
    type: "text",
    content: "Hey, how are you?",
    metadata: null,
    reply_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "m-4",
    room_id: "22222222-2222-2222-2222-222222222222",
    sender_id: "user-3-uuid",
    type: "text",
    content: "I'm good, thanks!",
    metadata: { mood: "relieved" },
    reply_to: "m-3",
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  // Project Team
  {
    id: "m-5",
    room_id: "33333333-3333-3333-3333-333333333333",
    sender_id: "user-3-uuid",
    type: "text",
    content: "Let's start the project!",
    metadata: { project: "Alpha" },
    reply_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "m-6",
    room_id: "33333333-3333-3333-3333-333333333333",
    sender_id: "user-1-uuid",
    type: "text",
    content: "I'm ready!",
    metadata: { project: "Alpha" },
    reply_to: "m-5",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
  },
  {
    id: "m-7",
    room_id: "33333333-3333-3333-3333-333333333333",
    sender_id: "user-2-uuid",
    type: "text",
    content: "Let's do this!",
    metadata: { project: "Alpha" },
    reply_to: "m-5",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
];

// Dummy user profiles for sender info
export const users = [
  {
    id: "user-1-uuid",
    username: "alice",
    first_name: "Alice",
    last_name: "Smith",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: "user-2-uuid",
    username: "bob",
    first_name: "Bob",
    last_name: "Johnson",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "user-3-uuid",
    username: "carol",
    first_name: "Carol",
    last_name: "Williams",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
];
