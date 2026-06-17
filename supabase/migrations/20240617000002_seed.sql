-- Seed: 3 hosts with active tests, 1 guest, 1 connection

-- Temporarily drop FK to allow seed inserts (profiles FK to auth.users)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

INSERT INTO public.profiles (id, role, name, age, city, bio, photos) VALUES
  ('00000000-0000-0000-0000-000000000001', 'guest', 'Rahul', 25, 'Mumbai', 'Product. Discipline over motivation.', ARRAY['https://i.pravatar.cc/400?img=12', 'https://i.pravatar.cc/400?img=13', 'https://i.pravatar.cc/400?img=14']),
  ('00000000-0000-0000-0000-000000000010', 'host', 'Priya', 24, 'Mumbai', 'Read 47 books this year. If you cannot name 3 authors, do not reach out.', ARRAY['https://i.pravatar.cc/400?img=5']),
  ('00000000-0000-0000-0000-000000000011', 'host', 'Aisha', 26, 'Bangalore', '5am or do not engage. PR: 100kg deadlift. Caliber required.', ARRAY['https://i.pravatar.cc/400?img=1']),
  ('00000000-0000-0000-0000-000000000012', 'host', 'Maya', 22, 'Delhi', 'Digital artist. 200-day streak. Looking for those who match my energy.', ARRAY['https://i.pravatar.cc/400?img=9'])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age, city = EXCLUDED.city, bio = EXCLUDED.bio, photos = EXCLUDED.photos;

INSERT INTO public.tests (id, host_id, name, difficulty, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Book Lover', 'medium', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'Fitness', 'hard', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', 'Foodie', 'easy', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tasks (test_id, day_number, description) VALUES
  ('10000000-0000-0000-0000-000000000001', 1, 'Selfie with today''s paper'),
  ('10000000-0000-0000-0000-000000000001', 2, 'Text: Why her standard?'),
  ('10000000-0000-0000-0000-000000000001', 3, 'Quiz: Name 3 books'),
  ('10000000-0000-0000-0000-000000000001', 4, '8k steps before 8pm'),
  ('10000000-0000-0000-0000-000000000001', 5, 'React to her latest read'),
  ('10000000-0000-0000-0000-000000000001', 6, 'No reels 12h. Proof.'),
  ('10000000-0000-0000-0000-000000000001', 7, 'Meme about reading'),
  ('10000000-0000-0000-0000-000000000001', 8, 'Write a 100-word review'),
  ('10000000-0000-0000-0000-000000000002', 1, 'Selfie with today''s paper'),
  ('10000000-0000-0000-0000-000000000002', 2, 'Text: Why her standard?'),
  ('10000000-0000-0000-0000-000000000002', 3, 'Quiz: What is her PR?'),
  ('10000000-0000-0000-0000-000000000002', 4, 'Run 5km before 7am'),
  ('10000000-0000-0000-0000-000000000002', 5, 'Voice: Your discipline routine'),
  ('10000000-0000-0000-0000-000000000002', 6, 'No sugar 24h. Proof.'),
  ('10000000-0000-0000-0000-000000000002', 7, 'Cook high-protein meal'),
  ('10000000-0000-0000-0000-000000000002', 8, 'Cold shower. Video.'),
  ('10000000-0000-0000-0000-000000000003', 1, 'Selfie with today''s paper'),
  ('10000000-0000-0000-0000-000000000003', 2, 'Text: Why her standard?'),
  ('10000000-0000-0000-0000-000000000003', 3, 'Quiz: What is her cuisine?'),
  ('10000000-0000-0000-0000-000000000003', 4, 'Cook a dish. Photo.'),
  ('10000000-0000-0000-0000-000000000003', 5, 'Voice: Your food story'),
  ('10000000-0000-0000-0000-000000000003', 6, 'Visit a new restaurant'),
  ('10000000-0000-0000-0000-000000000003', 7, 'Share a recipe'),
  ('10000000-0000-0000-0000-000000000003', 8, 'Host a dinner. Proof.')
ON CONFLICT DO NOTHING;

INSERT INTO public.connections (id, guest_id, host_id, test_id, status, current_day, tasks_completed, started_at, expires_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'active', 5, 5, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.submissions (connection_id, task_id, day_number, status, proof_url, submitted_at)
SELECT '20000000-0000-0000-0000-000000000001', id, day_number, 'approved', 'https://i.pravatar.cc/400?img=12', NOW() - INTERVAL '3 days'
FROM public.tasks WHERE test_id = '10000000-0000-0000-0000-000000000001' AND day_number <= 4
ON CONFLICT DO NOTHING;

INSERT INTO public.submissions (connection_id, task_id, day_number, status, proof_url, submitted_at)
SELECT '20000000-0000-0000-0000-000000000001', id, day_number, 'submitted', 'https://i.pravatar.cc/400?img=12', NOW()
FROM public.tasks WHERE test_id = '10000000-0000-0000-0000-000000000001' AND day_number = 5
ON CONFLICT DO NOTHING;

INSERT INTO public.messages (connection_id, sender_id, content, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'You actually did it.', NOW() - INTERVAL '12 hours'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'I read the brief.', NOW() - INTERVAL '11 hours'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Day 6: no reels for 12h. Clear?', NOW() - INTERVAL '10 hours'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Understood.', NOW() - INTERVAL '9 hours')
ON CONFLICT DO NOTHING;
