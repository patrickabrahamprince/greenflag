CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only admin role can select/insert/update/delete
CREATE POLICY "admin_access" ON public.audit_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE auth.uid() = p.id AND p.role = 'admin')
  );
