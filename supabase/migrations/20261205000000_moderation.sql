-- reports, blocked_pairs already exist (20261106000000_full_spec.sql,
-- 20261201000000_add_fk_cascade_rules.sql). This migration adds the
-- block-aware messages RLS and the unmatch_connection RPC.

-- messages RLS: also exclude if either side has blocked the other
DROP POLICY IF EXISTS "messages_participant" ON messages;
CREATE POLICY "messages_participant" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM connections c
      WHERE c.id = connection_id
        AND (c.guest_id = auth.uid() OR c.host_id = auth.uid())
        AND c.chat_unlocked = true
    )
    AND NOT EXISTS (
      SELECT 1 FROM connections c2
      JOIN blocked_pairs b ON
        (b.host_id = c2.host_id AND b.guest_id = c2.guest_id)
      WHERE c2.id = connection_id
    )
  );

-- unmatch_connection: deletes the connection between auth.uid() and
-- p_other_user_id (and its submissions/messages). messages cascades via
-- FK; submissions deleted explicitly as a defensive measure regardless
-- of FK cascade state.
DROP FUNCTION IF EXISTS unmatch_connection(UUID);
CREATE OR REPLACE FUNCTION unmatch_connection(p_other_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me UUID := auth.uid();
  v_connection_id UUID;
BEGIN
  SELECT id INTO v_connection_id
  FROM connections
  WHERE (guest_id = v_me AND host_id = p_other_user_id)
     OR (host_id = v_me AND guest_id = p_other_user_id)
  LIMIT 1;

  IF v_connection_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'connection_not_found');
  END IF;

  DELETE FROM submissions WHERE connection_id = v_connection_id;
  DELETE FROM messages WHERE connection_id = v_connection_id;
  DELETE FROM connections WHERE id = v_connection_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION unmatch_connection TO authenticated;
