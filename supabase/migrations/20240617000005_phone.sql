ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
