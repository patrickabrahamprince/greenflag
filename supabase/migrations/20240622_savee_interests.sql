ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';
CREATE INDEX IF NOT EXISTS profiles_interests_idx ON profiles USING GIN(interests);
