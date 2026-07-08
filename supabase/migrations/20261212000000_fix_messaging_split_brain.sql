-- Migration: Fix messaging split-brain
-- The messages table and its RLS/RPCs still reference connection_id / the
-- dropped `connections` table, and the app code separately assumed a
-- `conversations` table that was never created. The live relationship model
-- is `matches` (see 20261207000000_create_likes_matches.sql). This migration
-- moves messages onto match_id, matching the pattern already used for
-- submissions.match_id (20261209000001_match_task_flow.sql).

-- 1. Add match_id, pointing at the real relationship table.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);

-- messages.connection_id is orphaned legacy data (connections is gone);
-- leave it as-is rather than dropping, consistent with how
-- submissions.connection_id was left in place.

-- 2. Replace RLS policies that reference the dropped connections table.
-- messages_admin already existed (20261020000000_admin_rls.sql) and was
-- never dropped by anything in between -- missing here originally, which
-- makes CREATE POLICY below fail with "already exists" on any environment
-- that already has it (i.e. everywhere, including production). Also
-- switching its check from auth.email() = ANY(string_to_array(current_
-- setting('app.admin_emails', true), ',')) to public.is_admin(): that GUC
-- is never set anywhere in this migration history, so the old clause was
-- silently always-false dead code; public.is_admin() (20261107000000_fix_
-- rls_recursion.sql) is the pattern every other admin policy actually uses.
DROP POLICY IF EXISTS "messages_participant" ON messages;
DROP POLICY IF EXISTS "messages_guest" ON messages;
DROP POLICY IF EXISTS "admin_all_messages" ON messages;
DROP POLICY IF EXISTS "messages_admin" ON messages;

CREATE POLICY "messages_participant" ON messages FOR ALL USING (
  match_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM matches WHERE id = match_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "messages_admin" ON messages FOR ALL USING (
  public.is_admin()
);

-- 3. Redefine read-receipt RPCs to operate on match_id instead of the dead
-- connection_id / conversation_id naming.
DROP FUNCTION IF EXISTS public.mark_messages_read(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_match_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE messages
  SET read_at = NOW()
  WHERE match_id = p_match_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_messages_read(UUID) TO authenticated;

DROP FUNCTION IF EXISTS public.get_unread_messages_count(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_unread_messages_count(p_match_id UUID)
RETURNS INT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INT FROM messages
  WHERE match_id = p_match_id
    AND sender_id != auth.uid()
    AND read_at IS NULL;
$$;
GRANT EXECUTE ON FUNCTION public.get_unread_messages_count(UUID) TO authenticated;
