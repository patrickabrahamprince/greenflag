-- lib/rate-limit.ts used a plain in-memory Map, which is only ever
-- enforced per-server-instance. This app runs on Vercel's Edge middleware
-- (auth/admin routes) and serverless functions, both of which can have
-- several warm instances running concurrently, each with its own separate
-- JS heap -- so the real effective limit under concurrent traffic was the
-- configured number multiplied by however many instances happened to be
-- warm, not the configured number itself. This table + RPC replace it
-- with a single shared counter every instance reads and writes.
CREATE TABLE IF NOT EXISTS public.rate_limit_counters (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 0,
  window_start BIGINT NOT NULL
);

-- Atomic upsert-and-increment in one statement: the UNIQUE key + ON
-- CONFLICT means concurrent callers hitting the same window serialize on
-- Postgres's own row lock instead of racing a read-then-write like the
-- old in-memory version effectively did within a single instance.
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key TEXT, p_max_requests INT, p_window_ms BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now BIGINT := (extract(epoch from now()) * 1000)::BIGINT;
  v_window_start BIGINT := (v_now / p_window_ms) * p_window_ms;
  v_full_key TEXT := p_key || ':' || v_window_start;
  v_count INT;
BEGIN
  INSERT INTO rate_limit_counters (key, count, window_start)
  VALUES (v_full_key, 1, v_window_start)
  ON CONFLICT (key) DO UPDATE SET count = rate_limit_counters.count + 1
  RETURNING count INTO v_count;

  IF v_count > p_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after', CEIL((v_window_start + p_window_ms - v_now) / 1000.0)
    );
  END IF;

  RETURN jsonb_build_object('allowed', true, 'remaining', p_max_requests - v_count, 'retry_after', 0);
END;
$$;
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, BIGINT) FROM PUBLIC, authenticated, anon;

-- Periodic cleanup, mirroring the old in-memory version's own sweep --
-- without this the table grows forever instead of staying bounded to
-- roughly however many distinct (identifier, action, window) keys are
-- active in the last hour.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_counters()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff BIGINT := ((extract(epoch from now()) * 1000)::BIGINT) - 3600000;
  v_deleted INT;
BEGIN
  DELETE FROM rate_limit_counters WHERE window_start < v_cutoff;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN jsonb_build_object('deleted', v_deleted);
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_rate_limit_counters() FROM PUBLIC;

DO $$
BEGIN
  PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'cleanup-rate-limit-counters';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule('cleanup-rate-limit-counters', '*/15 * * * *', $$SELECT public.cleanup_rate_limit_counters();$$);

NOTIFY pgrst, 'reload schema';
