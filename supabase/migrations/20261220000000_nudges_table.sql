-- Tracks nudges sent (Discover page's Nudge button) so the API can tell
-- a first nudge on a profile (free) from a repeat one (costs coins --
-- the one exception to "women never pay" on this app).
CREATE TABLE IF NOT EXISTS public.nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nudges_from_to ON nudges(from_user_id, to_user_id);

ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nudges_select_own" ON nudges;
CREATE POLICY "nudges_select_own" ON nudges
  FOR SELECT USING (auth.uid() = from_user_id OR public.is_admin());

DROP POLICY IF EXISTS "nudges_insert_own" ON nudges;
CREATE POLICY "nudges_insert_own" ON nudges
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

NOTIFY pgrst, 'reload schema';
