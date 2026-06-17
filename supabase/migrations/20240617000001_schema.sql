CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('guest', 'host');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE trial_status AS ENUM ('pending', 'active', 'completed', 'failed', 'withdrawn');
CREATE TYPE task_status AS ENUM ('locked', 'pending', 'submitted', 'approved', 'rejected');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'guest',
  name TEXT NOT NULL DEFAULT 'User',
  age INT DEFAULT 25 CHECK (age >= 18 AND age <= 60),
  city TEXT DEFAULT 'Mumbai',
  bio TEXT DEFAULT 'New here' CHECK (char_length(bio) <= 120),
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL DEFAULT 'My Standard',
  difficulty difficulty_level DEFAULT 'medium',
  is_active BOOLEAN DEFAULT false,
  is_paused BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  day_number INT CHECK (day_number >= 1 AND day_number <= 8),
  description TEXT NOT NULL DEFAULT 'Submit a selfie',
  UNIQUE(test_id, day_number)
);

CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  status trial_status DEFAULT 'active',
  current_day INT DEFAULT 1,
  tasks_completed INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  streak_frozen BOOLEAN DEFAULT false,
  UNIQUE(guest_id, test_id)
);

CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  status task_status DEFAULT 'submitted',
  proof_url TEXT,
  proof_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.connections(id),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount INT DEFAULT 290000,
  type TEXT DEFAULT 'streak_freeze',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "tests_public_active" ON public.tests FOR SELECT USING (is_active = true);
CREATE POLICY "tests_host_all" ON public.tests FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "tasks_public" ON public.tasks FOR SELECT USING (true);

CREATE POLICY "connections_self" ON public.connections FOR ALL USING (auth.uid() = guest_id OR auth.uid() = host_id);

CREATE POLICY "submissions_self" ON public.submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.connections WHERE connections.id = submissions.connection_id AND (connections.guest_id = auth.uid() OR connections.host_id = auth.uid()))
);

CREATE POLICY "messages_self" ON public.messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.connections WHERE connections.id = messages.connection_id AND (connections.guest_id = auth.uid() OR connections.host_id = auth.uid()))
);

CREATE POLICY "payments_self" ON public.payments FOR ALL USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true) ON CONFLICT DO NOTHING;

CREATE POLICY "photos_public" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "photos_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
CREATE POLICY "proofs_auth" ON storage.objects FOR ALL USING (bucket_id = 'proofs' AND auth.role() = 'authenticated');
