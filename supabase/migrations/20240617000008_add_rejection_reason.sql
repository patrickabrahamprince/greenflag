-- Add a column to store the host's rejection reason when a submission is rejected.
-- This column is nullable because a submission may be approved or pending without a reason.
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Ensure idempotency for repeated runs.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.submissions ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;
