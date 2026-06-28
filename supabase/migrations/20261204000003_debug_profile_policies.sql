CREATE OR REPLACE FUNCTION public._debug_list_profile_policies()
RETURNS TABLE (policy_name text, cmd text, roles name[], using_expr text, check_expr text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    pol.polname::text,
    CASE pol.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' ELSE '*' END,
    pol.polroles::regrole[]::name[],
    pg_get_expr(pol.polqual, pol.polrelid),
    pg_get_expr(pol.polwithcheck, pol.polrelid)
  FROM pg_policy pol
  WHERE pol.polrelid = 'public.profiles'::regclass;
$$;
GRANT EXECUTE ON FUNCTION public._debug_list_profile_policies TO service_role;
