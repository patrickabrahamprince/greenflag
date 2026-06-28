-- Temporary diagnostic function to inspect triggers on profiles that
-- reference the now-dropped gender column. Will be dropped once the
-- real culprit is identified and fixed.
CREATE OR REPLACE FUNCTION public._debug_list_profile_triggers()
RETURNS TABLE (trigger_name text, function_name text, function_def text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.tgname::text,
    p.proname::text,
    pg_get_functiondef(p.oid)
  FROM pg_trigger t
  JOIN pg_proc p ON p.oid = t.tgfoid
  WHERE t.tgrelid = 'public.profiles'::regclass
    AND NOT t.tgisinternal;
$$;
GRANT EXECUTE ON FUNCTION public._debug_list_profile_triggers TO service_role;
