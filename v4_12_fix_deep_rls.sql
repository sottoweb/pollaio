-- FIX RLS BREEDS & HENS (v4.12)
-- Estende la sicurezza esplicita anche alle tabelle di dettaglio (Razze e Galline)

BEGIN;

-- 1. Assicuriamoci che organization_id esista (Safety check)
ALTER TABLE public.coop_breeds ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.hens ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 2. RLS per COOP_BREEDS
ALTER TABLE public.coop_breeds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Breeds All" ON public.coop_breeds;
DROP POLICY IF EXISTS "Org Members Breeds Select" ON public.coop_breeds;
DROP POLICY IF EXISTS "Org Members Breeds Insert" ON public.coop_breeds;
DROP POLICY IF EXISTS "Org Members Breeds Update" ON public.coop_breeds;
DROP POLICY IF EXISTS "Org Members Breeds Delete" ON public.coop_breeds;

CREATE POLICY "Org Members Breeds All" ON public.coop_breeds
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- 3. RLS per HENS
ALTER TABLE public.hens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Hens All" ON public.hens;
DROP POLICY IF EXISTS "Org Members Hens Select" ON public.hens;
DROP POLICY IF EXISTS "Org Members Hens Insert" ON public.hens;
DROP POLICY IF EXISTS "Org Members Hens Update" ON public.hens;
DROP POLICY IF EXISTS "Org Members Hens Delete" ON public.hens;

CREATE POLICY "Org Members Hens All" ON public.hens
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

COMMIT;
