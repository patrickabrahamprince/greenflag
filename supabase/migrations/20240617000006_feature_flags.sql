CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  value BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.feature_flags (key, value) VALUES
  ('signups_enabled', true),
  ('submissions_enabled', true),
  ('maintenance_mode', false);
