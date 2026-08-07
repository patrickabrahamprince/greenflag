-- Tracks which copy variant each user was last sent for a given nudge
-- type, so app/api/cron/engagement-nudges can A/B-test phrasing per user
-- deterministically (same user always sees the same variant for repeat
-- sends of the same nudge, rather than flip-flopping) and so the data
-- exists later for whoever analyzes which variant performs better.
alter table public.engagement_nudges
  add column if not exists last_variant int;
