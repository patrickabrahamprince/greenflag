-- Enable Supabase Realtime (postgres_changes) for the tables the task/review
-- flow needs to push live in-app notifications: partner submissions,
-- approvals/rejections, and day/chat unlocks. Also covers `messages`, whose
-- existing realtime chat subscription (app/messages/[connectionId]/page.tsx)
-- was already written expecting this but the table was never added to the
-- publication, so live chat updates were silently not firing either.
--
-- RLS already restricts these tables to match participants
-- (matches_select_participant, submissions_select_participant), so adding
-- them to the publication only starts broadcasting changes to users who
-- could already read the row via a normal SELECT.
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
