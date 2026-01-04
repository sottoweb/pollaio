-- SCRIPT DI RIPARAZIONE TOTALE (v4.2 FINAL)
-- Esegui questo script per sistemare tutto in un colpo solo.

-- 1. Aggiungi Colonne Mancanti (Se non ci sono già)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.coops 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 2. Migra i dati orfani (Assegna alla tua organizzazione)
DO $$
DECLARE
    target_org_id uuid;
BEGIN
    SELECT id INTO target_org_id FROM public.organizations LIMIT 1;

    IF target_org_id IS NOT NULL THEN
        UPDATE public.transactions SET organization_id = target_org_id WHERE organization_id IS NULL;
        UPDATE public.coops SET organization_id = target_org_id WHERE organization_id IS NULL;
        RAISE NOTICE 'Dati migrati alla Org: %', target_org_id;
    END IF;
END $$;

-- 3. RESET COMPLETO POLICIES (Sicurezza)

-- Transazioni
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Select Transactions" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Insert Transactions" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Update Transactions" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Delete Transactions" ON public.transactions;

CREATE POLICY "Org Members Transactions" ON public.transactions
FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- Pollai
ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Coops" ON public.coops;
DROP POLICY IF EXISTS "Org Members Select Coops" ON public.coops;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.coops;
-- (Drop generici per sicurezza)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.coops;

CREATE POLICY "Org Members Coops" ON public.coops
FOR ALL USING (
    organization_id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
);

-- Razze (coop_breeds)
ALTER TABLE public.coop_breeds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Breeds" ON public.coop_breeds;

CREATE POLICY "Org Members Breeds" ON public.coop_breeds 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.coops c
        WHERE c.id = coop_breeds.coop_id 
        AND c.organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);

-- Galline (hens) - CORRETTO
ALTER TABLE public.hens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Hens" ON public.hens;

CREATE POLICY "Org Members Hens" ON public.hens
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.coop_breeds cb
        JOIN public.coops c ON c.id = cb.coop_id
        WHERE cb.id = hens.coop_breed_id
        AND c.organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);
