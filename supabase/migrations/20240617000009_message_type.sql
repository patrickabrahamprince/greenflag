ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image'));

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_self" ON public.messages;
CREATE POLICY "messages_self" ON public.messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE connections.id = messages.connection_id
    AND (connections.guest_id = auth.uid() OR connections.host_id = auth.uid())
  )
);
