-- Migration : ajout des champs obligatoires au profil élève + consentement contrat

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.address IS 'Numéro et nom de rue';
COMMENT ON COLUMN public.profiles.address_complement IS 'Complément d''adresse (appartement, bâtiment…)';
COMMENT ON COLUMN public.profiles.city IS 'Ville';
COMMENT ON COLUMN public.profiles.postal_code IS 'Code postal';
COMMENT ON COLUMN public.profiles.birth_date IS 'Date de naissance';
COMMENT ON COLUMN public.profiles.contract_accepted_at IS 'Horodatage de l''acceptation électronique du contrat de formation';
