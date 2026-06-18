ALTER TABLE public.feature_flags ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);
