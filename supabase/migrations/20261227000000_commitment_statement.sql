-- Captured on /onboard/commitment (men only) -- a stated intention before
-- he ever spends coins on Meet Her Standard. Referenced back to him in
-- the confirm dialog for that action, and shown to admins for context on
-- the user detail page.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commitment_statement TEXT;

NOTIFY pgrst, 'reload schema';
