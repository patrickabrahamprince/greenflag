-- Optional profile-detail fields shown on the profile-viewing screen
-- (Lifestyle, Basics, "My Anthem" sections) and editable from
-- /profile/edit. All nullable and unconstrained at the DB level -- the
-- fixed option sets (e.g. smoking: "Non-smoker"/"Smoker"/"Social smoker")
-- live client-side in lib/constants/profileDetails.ts, same pattern as
-- looking_for_tags/interests_have, so adding a new option later doesn't
-- need a migration. Anthem is a manually-entered title/artist pair, not
-- a live Spotify search integration (that needs its own OAuth app + scope
-- decision), so no track/album-art URL columns yet.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS drinking TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pets TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS workout TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zodiac TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS family_plans TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS communication_style TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anthem_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anthem_artist TEXT;

NOTIFY pgrst, 'reload schema';
