-- Records when a user actually accepted Terms/Privacy, not just that they
-- did at some point -- needed as a real audit trail (dispute, regulator,
-- App Store inquiry) instead of the client-only localStorage flag that
-- previously tracked this and was lost on any reinstall or storage clear.
alter table public.profiles
  add column if not exists terms_accepted_at timestamptz;
