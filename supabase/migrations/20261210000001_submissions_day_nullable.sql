-- Legacy `day` column (superseded by day_number, added in
-- 20261106000000_full_spec.sql) is still NOT NULL with no default, blocking
-- match-based submissions that only set day_number. Same orphaned-constraint
-- story as connection_id in 20261210000000. Not created by any tracked
-- migration (untracked-hotfix drift, same pattern as elsewhere in this
-- history) -- guard so a fresh replay no-ops instead of erroring.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'day') THEN
    ALTER TABLE submissions ALTER COLUMN day DROP NOT NULL;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
