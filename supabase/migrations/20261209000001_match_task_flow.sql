-- Rebuild the 3-day Standard task flow on `matches` instead of the dropped
-- `connections` table. Mirrors the deleted submit-task route and
-- advance_day_if_complete() (20261109000001_finalize_three_day.sql) as
-- closely as possible, just keyed by match_id / user2_id (the woman) in
-- place of connection_id / host_id.

ALTER TABLE matches ADD COLUMN IF NOT EXISTS current_day INT NOT NULL DEFAULT 1 CHECK (current_day BETWEEN 1 AND 3);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'));
ALTER TABLE matches ADD COLUMN IF NOT EXISTS chat_unlocked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- submissions.connection_id is orphaned legacy data (connections is gone);
-- leave it as-is and add match_id alongside it for the new flow.
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS submissions_match_day_task_key;
CREATE UNIQUE INDEX submissions_match_day_task_key ON submissions(match_id, day_number, task_number) WHERE match_id IS NOT NULL;

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "submissions_match_participant" ON submissions;
CREATE POLICY "submissions_match_participant" ON submissions
  FOR ALL USING (
    match_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM matches m WHERE m.id = match_id AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.advance_match_day_if_complete(p_match_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_day INT;
  v_woman_id UUID;
  v_standard_id UUID;
  v_total_tasks INT;
  v_approved_tasks INT;
  v_day_advanced BOOLEAN := false;
  v_chat_unlocked BOOLEAN := false;
BEGIN
  SELECT current_day, user2_id INTO v_current_day, v_woman_id
  FROM matches WHERE id = p_match_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('day_advanced', false, 'chat_unlocked', false); END IF;

  SELECT id INTO v_standard_id
  FROM standards WHERE woman_id = v_woman_id AND is_active = true
  LIMIT 1;
  IF v_standard_id IS NULL THEN RETURN jsonb_build_object('day_advanced', false, 'chat_unlocked', false); END IF;

  SELECT COUNT(*) INTO v_total_tasks
  FROM intentions WHERE standard_id = v_standard_id AND day_number = v_current_day;

  SELECT COUNT(*) INTO v_approved_tasks
  FROM submissions
  WHERE match_id = p_match_id AND day_number = v_current_day AND approved = true;

  IF v_approved_tasks >= v_total_tasks AND v_total_tasks > 0 THEN
    IF v_current_day < 3 THEN
      UPDATE matches SET current_day = current_day + 1 WHERE id = p_match_id;
      v_day_advanced := true;
    ELSE
      UPDATE matches
      SET status = 'completed', chat_unlocked = true, completed_at = NOW()
      WHERE id = p_match_id;
      v_day_advanced := true;
      v_chat_unlocked := true;
    END IF;
  END IF;

  RETURN jsonb_build_object('day_advanced', v_day_advanced, 'chat_unlocked', v_chat_unlocked);
END;
$$;
GRANT EXECUTE ON FUNCTION public.advance_match_day_if_complete(UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
