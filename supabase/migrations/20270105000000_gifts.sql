-- Virtual gifting: a man can send a coin-priced gift to any woman from
-- Discover, matched or not -- a lighter, no-commitment way to express
-- interest than the 500-coin "Meet Her Standard" like. Mirrors the
-- nudges table's shape (ledger row per send, RLS scoped to the two
-- parties), but the catalog of gift types/costs lives in code
-- (lib/gift-types.ts), not in this table -- same pattern as
-- APPLE_COIN_PRODUCTS for coin packages, since it's a static list.
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  gift_type TEXT NOT NULL,
  cost INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gifts_to_user ON gifts(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gifts_from_user ON gifts(from_user_id, created_at DESC);

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gifts_select_own" ON gifts;
CREATE POLICY "gifts_select_own" ON gifts
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id OR public.is_admin());

-- Actual inserts happen server-side via the service-role client in
-- app/api/gifts/route.ts (so the coin deduction and the ledger row are
-- one atomic-enough sequence with a refund path on failure), but this
-- policy documents the intended shape and matches nudges/special_sends'
-- own "insert own" policy in case anything ever calls this directly.
DROP POLICY IF EXISTS "gifts_insert_own" ON gifts;
CREATE POLICY "gifts_insert_own" ON gifts
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

NOTIFY pgrst, 'reload schema';
