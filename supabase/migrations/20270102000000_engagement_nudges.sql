-- Marketing/re-engagement pushes (dormant winback, idle coins, unseen
-- matches, incomplete profile, early review nudge) are distinct from the
-- transactional notifications lib/notifications.ts already sends -- they
-- fire on a schedule/condition rather than a direct user action, and need
-- their own per-user-per-type send history so the cron in
-- app/api/cron/engagement-nudges doesn't re-send the same nudge every run.
create table if not exists public.engagement_nudges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  nudge_type text not null,
  sent_count int not null default 0,
  last_sent_at timestamptz not null default now(),
  primary key (user_id, nudge_type)
);

alter table public.engagement_nudges enable row level security;
-- No policies -- this is written/read only by the service-role cron
-- route, never by an end user's own client.

-- Runs frequently (every 30 min) since several of these nudges are timing-
-- sensitive (e.g. the 2h-after-submission early review nudge) -- pg_cron
-- rather than Vercel Cron because the Hobby plan allows only one Vercel
-- cron per day (see app/api/cron/daily/route.ts), same reason
-- send-review-reminders already runs this way.
--
-- Requires two Postgres GUCs set once, manually, in the SQL editor
-- (never hardcode a real secret into a committed migration file):
--   ALTER DATABASE postgres SET app.settings.greenflag_url = 'https://greenflag-dusky.vercel.app';
--   ALTER DATABASE postgres SET app.settings.cron_secret = '<the CRON_SECRET env var value>';
-- Without both set, this silently no-ops every run rather than erroring.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.trigger_engagement_nudges()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app_url TEXT := current_setting('app.settings.greenflag_url', true);
  v_cron_secret TEXT := current_setting('app.settings.cron_secret', true);
BEGIN
  IF v_app_url IS NULL OR v_cron_secret IS NULL THEN
    RETURN;
  END IF;
  PERFORM net.http_post(
    url := v_app_url || '/api/cron/engagement-nudges',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_cron_secret),
    body := '{}'::jsonb
  );
END;
$$;
REVOKE ALL ON FUNCTION public.trigger_engagement_nudges() FROM PUBLIC;

DO $$
BEGIN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'engagement-nudges';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('engagement-nudges', '*/30 * * * *', $$SELECT public.trigger_engagement_nudges();$$);
