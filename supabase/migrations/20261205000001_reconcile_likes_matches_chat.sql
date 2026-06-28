-- Reconciles the new likes/matches/conversations/chat system
-- (app/chat, app/(guest)/likes, lib/supabase/{profile,chat,notifications}.ts)
-- against the live database.
--
-- Two of its pending migrations (20250628_chat_system.sql,
-- 20250628_photos_likes.sql) reference tables that are never created
-- anywhere (conversations, matches), and both chat_system.sql and
-- 20250628_notifications.sql assume fresh messages/notifications tables,
-- but both already exist live with a different (connections-based)
-- schema - their CREATE TABLE IF NOT EXISTS would no-op and every
-- policy referencing the new columns would fail to apply.
--
-- This migration creates the missing tables and additively extends the
-- existing ones (nullable new columns, new policies alongside the old
-- ones) so the old connections-based chat/messages keep working
-- unmodified while the new conversation-based code gets the columns
-- and tables it expects.

-- 1. conversations (missing entirely)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_conversations" ON public.conversations;
CREATE POLICY "users_own_conversations" ON public.conversations
  FOR ALL TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 2. matches (missing entirely)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_own_matches" ON public.matches;
CREATE POLICY "users_own_matches" ON public.matches
  FOR ALL TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 3. extend existing messages table for the new conversation-based chat
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text' CHECK (type IN ('text', 'audio'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
ON public.messages (conversation_id, created_at DESC);

DROP POLICY IF EXISTS "users_read_own_conversation_messages" ON public.messages;
CREATE POLICY "users_read_own_conversation_messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "users_insert_own_conversation_messages" ON public.messages;
CREATE POLICY "users_insert_own_conversation_messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    conversation_id IS NOT NULL
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "users_update_own_conversation_messages" ON public.messages;
CREATE POLICY "users_update_own_conversation_messages" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- 4. extend existing notifications table for the new generic notification shape
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_body, p_link, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;

-- 5. photos table (no collision, fresh)
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_user_position ON public.photos (user_id, position);
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_read_all_photos" ON public.photos;
CREATE POLICY "users_read_all_photos" ON public.photos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "users_manage_own_photos" ON public.photos;
CREATE POLICY "users_manage_own_photos" ON public.photos FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. likes table (no collision, fresh) - block-aware insert + likes_received view
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'like' CHECK (type IN ('like', 'super')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (from_user_id, to_user_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_to_user_created ON public.likes (to_user_id, created_at DESC);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_see_likes_received" ON public.likes;
CREATE POLICY "users_see_likes_received" ON public.likes FOR SELECT TO authenticated USING (auth.uid() = to_user_id);
DROP POLICY IF EXISTS "users_create_likes" ON public.likes;
CREATE POLICY "users_create_likes" ON public.likes FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_pairs b
      WHERE (b.host_id = from_user_id AND b.guest_id = to_user_id)
         OR (b.host_id = to_user_id AND b.guest_id = from_user_id)
    )
  );
DROP POLICY IF EXISTS "users_delete_own_likes" ON public.likes;
CREATE POLICY "users_delete_own_likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = from_user_id);

DROP VIEW IF EXISTS public.likes_received;
CREATE VIEW public.likes_received AS
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
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_pairs b
    WHERE (b.host_id = l.from_user_id AND b.guest_id = l.to_user_id)
       OR (b.host_id = l.to_user_id AND b.guest_id = l.from_user_id)
  );

CREATE OR REPLACE FUNCTION public.deduct_coins(p_user_id UUID, p_amount INT, p_reason TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INT;
  v_new_balance INT;
BEGIN
  SELECT balance INTO v_balance FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  v_new_balance := v_balance - p_amount;
  UPDATE public.wallets SET balance = v_new_balance, updated_at = now() WHERE user_id = p_user_id;

  INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
  VALUES (p_user_id, 'spend', p_amount, v_new_balance, p_reason);

  RETURN TRUE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.deduct_coins(UUID, INT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.reveal_likes()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.deduct_coins(auth.uid(), 10, 'reveal_likes');
END;
$$;
GRANT EXECUTE ON FUNCTION public.reveal_likes TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', false)
ON CONFLICT (id) DO NOTHING;

-- 7. storage object policies
DROP POLICY IF EXISTS "users_upload_own_profile_photos" ON storage.objects;
CREATE POLICY "users_upload_own_profile_photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "users_manage_own_profile_photos" ON storage.objects;
CREATE POLICY "users_manage_own_profile_photos" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
CREATE POLICY "public_read_profile_photos" ON storage.objects FOR SELECT TO authenticated, anon
  USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "users_upload_own_voice_messages" ON storage.objects;
CREATE POLICY "users_upload_own_voice_messages" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-messages' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "conversation_members_read_voice_messages" ON storage.objects;
CREATE POLICY "conversation_members_read_voice_messages" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-messages'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
        AND (
          c.user1_id::text = (storage.foldername(name))[1]
          OR c.user2_id::text = (storage.foldername(name))[1]
        )
    )
  );

-- 8. unmatch_user: cleans up matches, conversations (cascades messages),
-- and likes both directions between auth.uid() and p_other_user_id.
DROP FUNCTION IF EXISTS public.unmatch_user(UUID);
CREATE OR REPLACE FUNCTION public.unmatch_user(p_other_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_me UUID := auth.uid();
BEGIN
  DELETE FROM public.matches
  WHERE (user1_id = v_me AND user2_id = p_other_user_id)
     OR (user1_id = p_other_user_id AND user2_id = v_me);

  DELETE FROM public.conversations
  WHERE (user1_id = v_me AND user2_id = p_other_user_id)
     OR (user1_id = p_other_user_id AND user2_id = v_me);

  DELETE FROM public.likes
  WHERE (from_user_id = v_me AND to_user_id = p_other_user_id)
     OR (from_user_id = p_other_user_id AND to_user_id = v_me);

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.unmatch_user TO authenticated;

-- Superseded by unmatch_user (targets the new likes/matches/conversations
-- system); this earlier draft targeted the old connections table.
DROP FUNCTION IF EXISTS unmatch_connection(UUID);
