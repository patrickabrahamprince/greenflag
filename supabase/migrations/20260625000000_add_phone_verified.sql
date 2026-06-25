ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- For existing email users, set to true so they aren't blocked
UPDATE profiles SET phone_verified = true WHERE phone IS NULL OR phone = '';
