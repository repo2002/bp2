-- Function to send a chat message and update room timestamp atomically
CREATE OR REPLACE FUNCTION send_chat_message(
  p_room_id UUID,
  p_sender_id UUID,
  p_content TEXT,
  p_type TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_reply_to UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
  v_message_data JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert message
    INSERT INTO chat_messages (
      room_id,
      sender_id,
      content,
      type,
      metadata,
      reply_to,
      created_at
    ) VALUES (
      p_room_id,
      p_sender_id,
      p_content,
      p_type,
      p_metadata,
      p_reply_to,
      NOW()
    )
    RETURNING id INTO v_message_id;

    -- Update room timestamp
    UPDATE chat_rooms
    SET updated_at = NOW()
    WHERE id = p_room_id;

    -- Get the complete message data with joins
    SELECT jsonb_build_object(
      'id', m.id,
      'room_id', m.room_id,
      'sender_id', m.sender_id,
      'content', m.content,
      'type', m.type,
      'metadata', m.metadata,
      'reply_to', m.reply_to,
      'created_at', m.created_at,
      'sender', jsonb_build_object(
        'id', s.id,
        'username', s.username,
        'first_name', s.first_name,
        'last_name', s.last_name,
        'image_url', s.image_url
      ),
      'reply', CASE 
        WHEN r.id IS NOT NULL THEN jsonb_build_object(
          'id', r.id,
          'content', r.content,
          'type', r.type,
          'sender', jsonb_build_object(
            'id', rs.id,
            'username', rs.username
          )
        )
        ELSE NULL
      END
    )
    INTO v_message_data
    FROM chat_messages m
    LEFT JOIN profiles s ON s.id = m.sender_id
    LEFT JOIN chat_messages r ON r.id = m.reply_to
    LEFT JOIN profiles rs ON rs.id = r.sender_id
    WHERE m.id = v_message_id;

    RETURN v_message_data;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to send message: %', SQLERRM;
  END;
END;
$$; 