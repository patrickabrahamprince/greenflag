-- Add FK ON DELETE rules for orphan-risk foreign keys
-- See schema audit: 9 FKs lacked ON DELETE rules

BEGIN;

-- 1. mod_queue.reviewed_by → auth.users(id) ON DELETE SET NULL
ALTER TABLE mod_queue
  DROP CONSTRAINT IF EXISTS mod_queue_reviewed_by_fkey,
  ADD CONSTRAINT mod_queue_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. freeze_transactions.man_id → profiles(id) ON DELETE CASCADE
ALTER TABLE freeze_transactions
  DROP CONSTRAINT IF EXISTS freeze_transactions_man_id_fkey,
  ADD CONSTRAINT freeze_transactions_man_id_fkey
    FOREIGN KEY (man_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. daily_discover_views.man_id → profiles(id) ON DELETE CASCADE
ALTER TABLE daily_discover_views
  DROP CONSTRAINT IF EXISTS daily_discover_views_man_id_fkey,
  ADD CONSTRAINT daily_discover_views_man_id_fkey
    FOREIGN KEY (man_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. daily_discover_views.woman_id → profiles(id) ON DELETE CASCADE
ALTER TABLE daily_discover_views
  DROP CONSTRAINT IF EXISTS daily_discover_views_woman_id_fkey,
  ADD CONSTRAINT daily_discover_views_woman_id_fkey
    FOREIGN KEY (woman_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. audit_logs.admin_id → profiles(id) ON DELETE SET NULL
ALTER TABLE audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_admin_id_fkey,
  ADD CONSTRAINT audit_logs_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- -- 6. reports.resolved_by → profiles(id) ON DELETE SET NULL
-- ALTER TABLE reports
--   DROP CONSTRAINT IF EXISTS reports_resolved_by_fkey,
--   ADD CONSTRAINT reports_resolved_by_fkey
--     FOREIGN KEY (resolved_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 7. admin_actions.admin_id → profiles(id) ON DELETE SET NULL
ALTER TABLE admin_actions
  DROP CONSTRAINT IF EXISTS admin_actions_admin_id_fkey,
  ADD CONSTRAINT admin_actions_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 8. coin_transactions.connection_id → connections(id) ON DELETE CASCADE
ALTER TABLE coin_transactions
  DROP CONSTRAINT IF EXISTS coin_transactions_connection_id_fkey,
  ADD CONSTRAINT coin_transactions_connection_id_fkey
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE;

COMMIT;

-- ========================================
-- Fix blocked_pairs schema conflict
-- ========================================
-- Multiple migrations created blocked_pairs with conflicting schemas.
-- The discover_men migration (20261023) created it with blocker_id/blocked_id,
-- but all RPC functions reference host_id/guest_id columns.
-- We drop the old table and recreate with proper FKs.

BEGIN;

DROP TABLE IF EXISTS public.blocked_pairs CASCADE;

CREATE TABLE public.blocked_pairs (
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (host_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_pairs_host ON public.blocked_pairs(host_id);
CREATE INDEX IF NOT EXISTS idx_blocked_pairs_guest ON public.blocked_pairs(guest_id);

ALTER TABLE public.blocked_pairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_blocks" ON public.blocked_pairs
  FOR ALL
  TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

COMMIT;

NOTIFY pgrst, 'reload schema';
