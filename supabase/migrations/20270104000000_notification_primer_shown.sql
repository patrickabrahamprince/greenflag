-- Tracks whether the one-time "enable notifications" primer has already
-- been shown to this user, so it fires exactly once (right after
-- onboarding completes) rather than on every app open.
alter table public.profiles
  add column if not exists push_primer_shown boolean not null default false;
