-- Seed: 3 women with active tests, 1 man, 1 connection
-- Uses inline SVG data URIs for profile photos (no external service dependency)

CREATE OR REPLACE FUNCTION gen_avatar_svg(p_name text, p_color text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN 'data:image/svg+xml;utf8,' ||
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">' ||
    '<rect width="400" height="400" fill="' || p_color || '"/>' ||
    '<circle cx="200" cy="160" r="60" fill="rgba(255,255,255,0.3)"/>' ||
    '<text x="200" y="180" text-anchor="middle" fill="white" font-size="48" font-family="sans-serif" font-weight="bold">' ||
    upper(left(p_name, 1)) || '</text>' ||
    '<ellipse cx="200" cy="300" rx="80" ry="40" fill="rgba(255,255,255,0.2)"/>' ||
    '</svg>';
END;
$$;

-- Temporarily drop FK to allow seed inserts (profiles FK to auth.users)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

INSERT INTO public.profiles (id, role, name, age, city, bio, photos) VALUES
  ('00000000-0000-0000-0000-000000000001', 'man', 'Rahul', 25, 'Mumbai', 'Product. Discipline over motivation.',
   ARRAY[gen_avatar_svg('Rahul', '#3B82F6'), gen_avatar_svg('R', '#2563EB'), gen_avatar_svg('R', '#1D4ED8')]),
  ('00000000-0000-0000-0000-000000000010', 'woman', 'Priya', 24, 'Mumbai',
   'Read 47 books this year. If you cannot name 3 authors, do not reach out.',
   ARRAY[gen_avatar_svg('Priya', '#EC4899')]),
  ('00000000-0000-0000-0000-000000000011', 'woman', 'Aisha', 26, 'Bangalore',
   '5am or do not engage. PR: 100kg deadlift. Caliber required.',
   ARRAY[gen_avatar_svg('Aisha', '#F59E0B')]),
  ('00000000-0000-0000-0000-000000000012', 'woman', 'Maya', 22, 'Delhi',
   'Digital artist. 200-day streak. Looking for those who match my energy.',
   ARRAY[gen_avatar_svg('Maya', '#10B981')])
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, age = EXCLUDED.age, city = EXCLUDED.city,
  bio = EXCLUDED.bio, photos = EXCLUDED.photos;

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
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001',
   'active', 5, 5, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.submissions (connection_id, task_id, day_number, status, proof_url, submitted_at)
SELECT '20000000-0000-0000-0000-000000000001', id, day_number, 'approved',
  gen_avatar_svg('✓', '#22C55E'), NOW() - INTERVAL '3 days'
FROM public.tasks WHERE test_id = '10000000-0000-0000-0000-000000000001' AND day_number <= 4
ON CONFLICT DO NOTHING;

INSERT INTO public.submissions (connection_id, task_id, day_number, status, proof_url, submitted_at)
SELECT '20000000-0000-0000-0000-000000000001', id, day_number, 'submitted',
  gen_avatar_svg('?', '#F59E0B'), NOW()
FROM public.tasks WHERE test_id = '10000000-0000-0000-0000-000000000001' AND day_number = 5
ON CONFLICT DO NOTHING;

INSERT INTO public.messages (connection_id, sender_id, content, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'You actually did it.', NOW() - INTERVAL '12 hours'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'I read the brief.', NOW() - INTERVAL '11 hours'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Day 6: no reels for 12h. Clear?', NOW() - INTERVAL '10 hours'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Understood.', NOW() - INTERVAL '9 hours')
ON CONFLICT DO NOTHING;

DROP FUNCTION gen_avatar_svg;
