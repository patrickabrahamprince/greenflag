-- Drop temporary diagnostic helpers used to trace the persona_check
-- investigation (20261204000005, 20261204000006). Root cause was a stale
-- Vercel deployment, not a DB issue - no schema fix was needed here.
DROP FUNCTION IF EXISTS public._debug_persona_check();
DROP FUNCTION IF EXISTS public._debug_list_profile_triggers2();
