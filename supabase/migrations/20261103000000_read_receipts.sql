-- Add read_at to messages for read receipts
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Index for unread count queries
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(connection_id, sender_id, read_at)
  WHERE read_at IS NULL;

-- RPC: Mark messages as read for a connection
CREATE OR REPLACE FUNCTION mark_messages_read(p_connection_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE connection_id = p_connection_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_messages_read TO authenticated;

-- RPC: Get unread count for a connection
CREATE OR REPLACE FUNCTION get_unread_messages_count(p_connection_id UUID)
RETURNS INT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INT FROM messages
  WHERE connection_id = p_connection_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
$$;

GRANT EXECUTE ON FUNCTION get_unread_messages_count TO authenticated;

NOTIFY pgrst, 'reload schema';
