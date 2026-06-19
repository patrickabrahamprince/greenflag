-- Diagnostic: check if column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- If looking_for_interests is missing, add it
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS looking_for_interests TEXT[] DEFAULT '{}';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Hard schema reload
SELECT pg_catalog.pg_notify('pgrst', 'reload schema');
