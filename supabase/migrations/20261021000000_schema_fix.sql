-- Schema fix: add missing columns and fix gender

-- Add gender column (maps to role functionally)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('woman', 'man', 'host', 'guest'));

-- Ensure city_auto exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city_auto TEXT;

-- Ensure lat/lng exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Create indexes for geo queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(lat, lng);

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
