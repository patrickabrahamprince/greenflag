-- Legacy `day` column (superseded by day_number, added in
-- 20261106000000_full_spec.sql) is still NOT NULL with no default, blocking
-- match-based submissions that only set day_number. Same orphaned-constraint
-- story as connection_id in 20261210000000.
ALTER TABLE submissions ALTER COLUMN day DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
