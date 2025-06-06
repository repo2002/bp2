-- Function to handle event invitation process atomically
CREATE OR REPLACE FUNCTION invite_user_to_private_event(
  p_event_id UUID,
  p_invitee_id UUID,
  p_inviter_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_data JSONB;
  v_invitation_id UUID;
  v_chat_room_id UUID;
  v_result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- 1. Get event details and verify ownership
    SELECT jsonb_build_object(
      'id', e.id,
      'title', e.title,
      'description', e.description,
      'location', e.location,
      'start_time', e.start_time,
      'end_time', e.end_time,
      'image_url', (
        SELECT image_url 
        FROM event_images 
        WHERE event_id = e.id 
        AND (is_primary = true OR is_primary IS NULL)
        LIMIT 1
      )
    )
    INTO v_event_data
    FROM events e
    WHERE e.id = p_event_id
    AND e.creator_id = p_inviter_id;

    IF v_event_data IS NULL THEN
      RAISE EXCEPTION 'Event not found or you are not the owner';
    END IF;

    -- 2. Verify follower relationship
    IF NOT EXISTS (
      SELECT 1 
      FROM followers 
      WHERE follower_id = p_invitee_id 
      AND following_id = p_inviter_id 
      AND status = 'accepted'
    ) THEN
      RAISE EXCEPTION 'You can only invite your followers';
    END IF;

    -- 3. Create invitation
    INSERT INTO event_invitations (
      event_id,
      user_id,
      inviter_id,
      status
    ) VALUES (
      p_event_id,
      p_invitee_id,
      p_inviter_id,
      'pending'
    )
    RETURNING id INTO v_invitation_id;

    -- 4. Create notification
    INSERT INTO notifications (
      user_id,
      sender_id,
      category,
      reference_type,
      reference_id
    ) VALUES (
      p_invitee_id,
      p_inviter_id,
      'invite',
      'event',
      p_event_id
    );

    -- 5. Find or create chat room
    SELECT id INTO v_chat_room_id
    FROM chat_rooms cr
    WHERE cr.is_group = false
    AND EXISTS (
      SELECT 1 
      FROM chat_participants cp1 
      WHERE cp1.room_id = cr.id 
      AND cp1.user_id = p_inviter_id
    )
    AND EXISTS (
      SELECT 1 
      FROM chat_participants cp2 
      WHERE cp2.room_id = cr.id 
      AND cp2.user_id = p_invitee_id
    )
    LIMIT 1;

    IF v_chat_room_id IS NULL THEN
      -- Create new chat room
      INSERT INTO chat_rooms (
        is_group,
        created_by,
        updated_at
      ) VALUES (
        false,
        p_inviter_id,
        NOW()
      )
      RETURNING id INTO v_chat_room_id;

      -- Add participants
      INSERT INTO chat_participants (room_id, user_id, role)
      VALUES 
        (v_chat_room_id, p_inviter_id, 'admin'),
        (v_chat_room_id, p_invitee_id, 'member');
    END IF;

    -- Build result
    v_result := jsonb_build_object(
      'event', v_event_data,
      'invitation_id', v_invitation_id,
      'chat_room_id', v_chat_room_id
    );

    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to invite user: %', SQLERRM;
  END;
END;
$$; 