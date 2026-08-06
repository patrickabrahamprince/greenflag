-- Settings -> Notifications toggles were previously pure client-side
-- useState with no backend at all: flipping a switch had zero effect and
-- reset on every reload. This gives them a real, per-user home so
-- lib/notifications.ts can actually honor them before sending a push.
alter table public.profiles
  add column if not exists push_prefs jsonb not null default '{
    "messages": true,
    "matches": true,
    "nudges": true,
    "dailyRecap": true,
    "other": true
  }'::jsonb;
