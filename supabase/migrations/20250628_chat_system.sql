-- /supabase/migrations/20250628_chat_system.sql

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'audio')),
  audio_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at 
ON public.messages (conversation_id, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own conversation messages" 
ON public.messages FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);

CREATE POLICY "users can insert own messages" 
ON public.messages FOR INSERT 
TO authenticated 
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);

CREATE OR REPLACE FUNCTION public.deduct_coins(p_user_id UUID, p_amount INT, p_reason TEXT)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-messages', 'voice-messages', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload voice messages to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voice-messages' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to read voice messages if in conversation"
ON storage.objects FOR SELECT
TO authenticated
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
