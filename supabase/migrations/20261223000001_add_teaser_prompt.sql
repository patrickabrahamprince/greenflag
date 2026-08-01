ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS teaser_prompt TEXT,
  ADD COLUMN IF NOT EXISTS teaser_answer TEXT;

NOTIFY pgrst, 'reload schema';
