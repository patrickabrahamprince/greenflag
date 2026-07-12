-- Fresh `supabase start` replay was missing these two columns entirely,
-- even though production has had them for a while (added by hand via the
-- Dashboard SQL Editor during an earlier live-production hotfix and never
-- captured as a migration). Discovered while building the match-flow
-- backend test suite: local replay diverged from production, exactly the
-- kind of drift this repo has been bitten by more than once.
--
-- `intentions` (jsonb) predates the current `intentions` table (day-by-day
-- prompts) and is kept only because app code still writes `{}` into it on
-- every standards insert; `active` duplicates `is_active` for the same
-- historical reason. Neither is read by current app logic -- both exist
-- purely so inserts matching production's NOT NULL constraints don't fail.
ALTER TABLE public.standards
  ADD COLUMN IF NOT EXISTS intentions JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
