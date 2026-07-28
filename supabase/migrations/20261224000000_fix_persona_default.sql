-- profiles.persona has a stale column DEFAULT of 'guest', a leftover from
-- the original `role TEXT CHECK (role IN ('guest','host'))` column
-- (20261019000000_init.sql) that survived the rename to `persona` and the
-- later persona_check CHECK (persona IN ('man','woman')) constraint
-- (20261106000000_full_spec.sql) without ever being updated itself.
--
-- Confirmed live: any INSERT or UPSERT on profiles that omits `persona`
-- fails with "violates check constraint persona_check" because Postgres
-- fills the missing column with its DEFAULT ('guest') -- which the CHECK
-- constraint then rejects. This silently breaks any upsert (e.g. the
-- onboarding interests step) that doesn't explicitly re-send persona on
-- every call. handle_new_user() already defaults new signups to 'man'
-- explicitly, so this just makes the column's own default consistent
-- with that instead of the dead 'guest' value.
ALTER TABLE profiles ALTER COLUMN persona SET DEFAULT 'man';

NOTIFY pgrst, 'reload schema';
