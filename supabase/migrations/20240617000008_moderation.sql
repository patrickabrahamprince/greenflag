ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS moderation_note TEXT;

ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS flag_reason TEXT;

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON public.admin_logs(admin_id, created_at DESC);
