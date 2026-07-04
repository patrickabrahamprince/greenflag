-- Funnel tracking for the match lifecycle. Not present anywhere in prior
-- migrations. Event vocabulary matches the state machine introduced in
-- 20261213000000-000004, with one deliberate substitution: this migration
-- set never produces a distinct 'expired_no_review' state (the sweep goes
-- straight pending_review -> refunded, see 20261213000000's comment), so
-- the funnel event for that transition is 'refunded', not
-- 'expired_no_review'.
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'entered_queue', 'submitted', 'approved', 'rejected',
    'expired_no_submission', 'refunded', 'chat_unlocked'
  )),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_match_id ON public.funnel_events(match_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_type ON public.funnel_events(event_type);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Admin-only, following the existing is_admin() SECURITY DEFINER pattern
-- used by audit_logs/mod_queue/reports (20261107000000_fix_rls_recursion.sql)
-- rather than re-deriving admin status inline and risking the same RLS
-- recursion that pattern was introduced to fix.
DROP POLICY IF EXISTS "funnel_events_admin_only" ON public.funnel_events;
CREATE POLICY "funnel_events_admin_only" ON public.funnel_events FOR ALL USING (
  public.is_admin()
);

NOTIFY pgrst, 'reload schema';
