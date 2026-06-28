-- The gender column was dropped in 20261203000000_ship_phase1_fixes.sql,
-- but an untracked trigger (trg_sync_profiles_gender_persona, created
-- out-of-band on the live DB, found via _debug_list_profile_triggers)
-- still tried to set NEW.gender on every insert/update to profiles.
-- This broke every profiles write, including the auth.users on_auth_sign_in
-- trigger's UPDATE profiles SET last_active = NOW(), which made every
-- login fail with "Database error granting user".
DROP TRIGGER IF EXISTS trg_sync_profiles_gender_persona ON profiles;
DROP FUNCTION IF EXISTS public.sync_profiles_gender_persona();

-- Remove the temporary diagnostic helper now that the culprit is found.
DROP FUNCTION IF EXISTS public._debug_list_profile_triggers();
