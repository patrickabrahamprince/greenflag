-- Recreate likes/matches as real tables. 20261206000012_drop_connections.sql
-- rewrote get_matching_profiles()/get_ranked_women() to query `likes` and
-- `matches`, but never created either table — discover has been failing
-- server-side since that migration landed. This adds the tables, RLS, and
-- the create_like() RPC that the connect button needs.

-- Untracked hotfix migrations (20261205000000-2) were applied directly to
-- this project outside the repo and appear to have already created `likes`/
-- `matches` with the same shape get_matching_profiles()/get_ranked_women()
-- already expect (from_user_id/to_user_id, user1_id/user2_id). Everything
-- below is idempotent so it's safe whether or not those tables pre-exist.

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (from_user_id, to_user_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_from_user ON likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_to_user ON likes(to_user_id);

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user1_id, user2_id)
);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "likes_insert_own" ON likes;
CREATE POLICY "likes_insert_own" ON likes
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);
DROP POLICY IF EXISTS "likes_select_participant" ON likes;
CREATE POLICY "likes_select_participant" ON likes
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "matches_select_participant" ON matches;
CREATE POLICY "matches_select_participant" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- A man "meeting her Standard" spends 100 coins and immediately starts a
-- connection — there's no reciprocal swipe UI yet, so a like from a man
-- creates the match immediately rather than waiting on a mutual like.
CREATE OR REPLACE FUNCTION public.create_like(p_to_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_from_user_id UUID := auth.uid();
  v_deduct JSONB;
  v_like_id UUID;
  v_match_id UUID;
BEGIN
  IF v_from_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  v_deduct := deduct_coins(v_from_user_id, 100, 'Meet Her Standard', jsonb_build_object('to_user_id', p_to_user_id));
  IF NOT (v_deduct->>'success')::BOOLEAN THEN
    RETURN v_deduct;
  END IF;

  INSERT INTO likes (from_user_id, to_user_id)
  VALUES (v_from_user_id, p_to_user_id)
  ON CONFLICT (from_user_id, to_user_id) DO NOTHING
  RETURNING id INTO v_like_id;

  INSERT INTO matches (user1_id, user2_id)
  VALUES (v_from_user_id, p_to_user_id)
  ON CONFLICT (user1_id, user2_id) DO NOTHING
  RETURNING id INTO v_match_id;

  IF v_match_id IS NULL THEN
    SELECT id INTO v_match_id FROM matches
    WHERE (user1_id = v_from_user_id AND user2_id = p_to_user_id)
       OR (user1_id = p_to_user_id AND user2_id = v_from_user_id);
  END IF;

  RETURN jsonb_build_object('success', true, 'like_id', v_like_id, 'match_id', v_match_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_like(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
