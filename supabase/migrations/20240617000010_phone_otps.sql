CREATE TABLE IF NOT EXISTS public.phone_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '5 minutes',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON public.phone_otps(phone);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "phone_otps_all" ON public.phone_otps;
CREATE POLICY "phone_otps_all" ON public.phone_otps FOR ALL USING (true);

DROP POLICY IF EXISTS "profiles_self_delete" ON public.profiles;
CREATE POLICY "profiles_self_delete" ON public.profiles FOR DELETE USING (auth.uid() = id);
