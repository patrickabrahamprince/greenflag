-- app/onboarding/dob/page.tsx writes profiles.dob but no migration ever
-- added the column; this was blocking the production build's type check.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;

NOTIFY pgrst, 'reload schema';
