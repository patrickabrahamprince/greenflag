-- Defense-in-depth for the new DOB-based age gate in onboarding
-- (app/(auth)/onboard/profile/page.tsx). The client-side check (compute
-- real age from date of birth, block under-18) is the primary gate; this
-- stops it being bypassed by a direct API call. Nullable-safe so it
-- doesn't retroactively break existing users who onboarded before this
-- change and have no dob set -- only enforced going forward, once a dob
-- is actually provided.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_dob_min_age_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_dob_min_age_check
  CHECK (dob IS NULL OR age(dob) >= interval '18 years');

NOTIFY pgrst, 'reload schema';
