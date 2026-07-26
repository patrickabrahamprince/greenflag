-- The 90s review-timer banner was anchored to profiles.created_at, but a
-- real onboarding run (phone OTP, profile+photos, 8 quiz questions,
-- interests, 6 rule slides, how-it-works) routinely takes several
-- minutes -- far longer than 90 seconds. By the time anyone actually
-- reached the screen that shows the countdown, it had almost always
-- already elapsed, so the banner silently self-approved before ever
-- being visible. Anchoring to a timestamp set right when onboarding
-- actually finishes (not when the account was first created) fixes that
-- for both personas.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_started_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
