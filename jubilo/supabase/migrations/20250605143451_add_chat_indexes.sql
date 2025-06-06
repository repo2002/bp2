-- Indexes for chat_rooms
CREATE INDEX IF NOT EXISTS chat_rooms_created_by_idx ON public.chat_rooms (created_by);
CREATE INDEX IF NOT EXISTS chat_rooms_is_group_idx ON public.chat_rooms (is_group);

-- Indexes for chat_participants
CREATE INDEX IF NOT EXISTS chat_participants_user_id_idx ON public.chat_participants (user_id);
CREATE INDEX IF NOT EXISTS chat_participants_room_id_idx ON public.chat_participants (room_id);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS chat_messages_room_id_idx ON public.chat_messages (room_id);
CREATE INDEX IF NOT EXISTS chat_messages_room_id_created_at_idx ON public.chat_messages (room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_sender_id_idx ON public.chat_messages (sender_id); 