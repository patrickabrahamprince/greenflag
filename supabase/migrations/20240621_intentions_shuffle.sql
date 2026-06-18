-- Add columns to tests table
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS intentions TEXT[] DEFAULT '{}';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS tasks JSONB;

-- Create index on intentions
CREATE INDEX IF NOT EXISTS tests_intentions_idx ON public.tests USING GIN(intentions);

-- Add test_snapshot to connections table
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS test_snapshot JSONB;

-- Add interests to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Migration for existing data
UPDATE public.tests SET intentions = ARRAY['fitness'], title = 'Fitness Standard', tasks = '[]'::jsonb WHERE intentions = '{}' OR intentions IS NULL;
