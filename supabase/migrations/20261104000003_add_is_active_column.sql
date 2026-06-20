-- Fix: is_active column was defined in init migration but never created
-- The profiles_public_read RLS policy references it, causing all SELECT queries to fail silently
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure your admin profile has it set
UPDATE profiles SET is_active = true WHERE id = '1d9d31cb-fa9f-4af4-a60d-5cd3a6bf519d';
