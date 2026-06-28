-- /supabase/migrations/20250628_photos_likes.sql

-- Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_photos_user_position 
ON public.photos (user_id, position);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read all photos" 
ON public.photos FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "users manage own photos" 
ON public.photos FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow users to upload profile photos to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to manage own profile photos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow public read access to profile photos"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (bucket_id = 'profile-photos');

-- Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'like' CHECK (type IN ('like', 'super')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_to_user_created 
ON public.likes (to_user_id, created_at DESC);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see likes received" 
ON public.likes FOR SELECT 
TO authenticated 
USING (auth.uid() = to_user_id);

CREATE POLICY "users create likes" 
ON public.likes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "users delete own likes" 
ON public.likes FOR DELETE 
TO authenticated 
USING (auth.uid() = from_user_id);

-- View for received likes
CREATE OR REPLACE VIEW public.likes_received AS
SELECT 
  l.id, 
  l.from_user_id, 
  l.created_at, 
  p.name, 
  p.age, 
  ph.url AS photo_url 
FROM public.likes l 
JOIN public.profiles p ON p.id = l.from_user_id 
LEFT JOIN LATERAL (
  SELECT url FROM public.photos 
  WHERE user_id = l.from_user_id 
  ORDER BY position LIMIT 1
) ph ON TRUE 
WHERE l.to_user_id = auth.uid() 
AND NOT EXISTS (
  SELECT 1 FROM public.matches m 
  WHERE (m.user1_id = l.from_user_id AND m.user2_id = l.to_user_id) 
  OR (m.user1_id = l.to_user_id AND m.user2_id = l.from_user_id)
);

-- RPC for revealing likes
CREATE OR REPLACE FUNCTION public.reveal_likes()
RETURNS BOOLEAN AS $$
BEGIN
  IF public.deduct_coins(auth.uid(), 10, 'reveal_likes') THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
