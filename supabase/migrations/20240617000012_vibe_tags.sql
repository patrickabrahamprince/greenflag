ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS about_me_tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS looking_for_tags text[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_profiles_about_me ON profiles USING GIN (about_me_tags);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles USING GIN (looking_for_tags);
