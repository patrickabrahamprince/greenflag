CREATE OR REPLACE FUNCTION public._debug_persona_check()
RETURNS TABLE (constraint_name text, definition text, enum_labels text[])
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    con.conname::text,
    pg_get_constraintdef(con.oid),
    (SELECT array_agg(enumlabel::text ORDER BY enumsortorder) FROM pg_enum WHERE enumtypid = (SELECT atttypid FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'persona'))
  FROM pg_constraint con
  WHERE con.conrelid = 'public.profiles'::regclass
    AND con.contype = 'c'
    AND con.conname LIKE '%persona%';
$$;
GRANT EXECUTE ON FUNCTION public._debug_persona_check TO service_role;
