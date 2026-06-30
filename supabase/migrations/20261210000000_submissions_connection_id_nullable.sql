-- submissions.connection_id was NOT NULL from the connections-era schema.
-- The new match-based task flow (20261209000001_match_task_flow.sql) inserts
-- rows keyed by match_id instead and never sets connection_id, which violated
-- this constraint on every task submission ("null value in column
-- connection_id ... violates not-null constraint"). connection_id itself is
-- already orphaned (connections table was dropped), so just relax it.
ALTER TABLE submissions ALTER COLUMN connection_id DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
