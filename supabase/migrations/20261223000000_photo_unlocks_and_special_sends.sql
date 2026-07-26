-- photo_unlocks: a man paying to unlock a woman's extra (blurred) Discover
-- photos is a standalone purchase, unrelated to "Meet Her Standard" (which
-- spends 500 coins to begin the 3-day flow). Persists permanently once
-- paid -- unlike the submission/special-send "reveal again" mechanic below,
-- which is deliberately ephemeral (re-blurs each fresh visit).
CREATE TABLE IF NOT EXISTS public.photo_unlocks (
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (viewer_id, target_id)
);

ALTER TABLE photo_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photo_unlocks_select_own" ON photo_unlocks;
CREATE POLICY "photo_unlocks_select_own" ON photo_unlocks
  FOR SELECT USING (auth.uid() = viewer_id OR public.is_admin());

-- special_sends: an optional, one-time-per-day bonus a man can pay to send
-- on top of her 3 required daily tasks -- a note/photo/voice with no
-- prompt attached. UNIQUE(match_id, day_number) enforces "one time
-- opportunity" per day at the database level, not just in application code.
CREATE TABLE IF NOT EXISTS public.special_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'photo', 'voice')),
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  UNIQUE (match_id, day_number)
);

ALTER TABLE special_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "special_sends_select_participant" ON special_sends;
CREATE POLICY "special_sends_select_participant" ON special_sends
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = special_sends.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

NOTIFY pgrst, 'reload schema';
