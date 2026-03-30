-- Activer RLS sur promo_codes (lecture/écriture uniquement via service role)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Lecture publique autorisée (pour afficher le nom du code dans l'UI)
-- mais modification uniquement via edge functions (service role)
CREATE POLICY "Public can read active promo codes" ON public.promo_codes
  FOR SELECT USING (active = true);

-- Activer RLS sur rate_limits (accessible uniquement via service role)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- Aucune policy = accès refusé en direct, tout passe par le service role des edge functions

-- Empêcher les utilisateurs de modifier eux-mêmes is_admin
CREATE OR REPLACE FUNCTION public.prevent_admin_self_grant()
RETURNS TRIGGER AS $$
BEGIN
  -- Si quelqu'un essaie de changer is_admin via l'API client, bloquer
  IF OLD.is_admin IS DISTINCT FROM NEW.is_admin AND auth.uid() = NEW.id THEN
    NEW.is_admin := OLD.is_admin;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_admin_self_grant_trigger ON public.profiles;
CREATE TRIGGER prevent_admin_self_grant_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_admin_self_grant();
