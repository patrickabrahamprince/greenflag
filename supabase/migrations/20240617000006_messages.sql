DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'messages_unlocked') THEN
    ALTER TABLE public.connections
      ADD COLUMN messages_unlocked BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN messages_unlocked_at TIMESTAMPTZ;
  END IF;
END $$;
