-- Local replay still had the pre-rename `proof_text` column; production's
-- submit-task route has written to `content` for a while (confirmed via a
-- live production row while building the match-flow backend test suite).
-- Not dropping `proof_text` here -- that's a separate, larger reconciliation
-- (local also still carries proof_url/status/rejection_reason/task_id,
-- which production no longer has) that deserves its own deliberate pass
-- rather than being bundled into an unrelated test-suite change.
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS content TEXT;
