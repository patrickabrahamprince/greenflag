-- Fix: review-task API route and auto-approve Edge Function both write
-- reviewed_at on submissions, but the column was missing from the live
-- schema (likely dropped/never carried over during a prior schema sync),
-- causing every Approve/Reject action to fail with a 400 error.
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
