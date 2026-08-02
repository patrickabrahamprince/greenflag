-- Swiping a notification right now pins it (stays at the top, survives
-- a normal swipe-left-to-delete) instead of both directions doing the
-- same delete action.
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;
