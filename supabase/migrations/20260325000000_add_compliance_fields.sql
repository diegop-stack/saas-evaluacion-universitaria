-- Adición de campos de cumplimiento legal y aceptación de políticas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS accepted_policies BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMPTZ;
