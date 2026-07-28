-- Native push (APNs) device tokens. Separate from push_subscriptions
-- (which stores Web Push subscription objects -- endpoint/p256dh/auth --
-- an entirely different shape from a bare APNs token string), so this
-- doesn't require reshaping or overloading that existing table.
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'ios' CHECK (platform IN ('ios', 'android')),
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own device tokens" ON device_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all device tokens" ON device_tokens
  FOR SELECT USING (is_admin());

NOTIFY pgrst, 'reload schema';
