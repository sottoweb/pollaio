-- EMERGENCY REPAIR SCRIPT (v4.5)
-- Questo script forza la visibilità dei dati.

-- 1. Assicuriamoci che esista almeno un'organizzazione
DO $$
DECLARE
    target_org_id uuid;
    target_owner_id uuid;
BEGIN
    SELECT id, owner_id INTO target_org_id, target_owner_id FROM public.organizations LIMIT 1;

    IF target_org_id IS NOT NULL THEN
        RAISE NOTICE 'Ripristino dati verso Org: %', target_org_id;

        -- 2. ASSEGNAZIONE FORZATA ORG_ID (Se nulli o se tutti i dati devono essere tuoi)
        -- Nota: Questo assegna TUTTO all'unica organizzazione trovata.
        UPDATE public.transactions SET organization_id = target_org_id; -- WHERE organization_id IS NULL (Rimosso WHERE per forzare fix)
        UPDATE public.coops SET organization_id = target_org_id;
        
        -- 3. FIX CREATED_BY (Se nulli)
        IF target_owner_id IS NOT NULL THEN
            UPDATE public.transactions SET created_by = target_owner_id WHERE created_by IS NULL;
            UPDATE public.coops SET created_by = target_owner_id WHERE created_by IS NULL;
            UPDATE public.hens SET created_by = target_owner_id WHERE created_by IS NULL;
        END IF;

    ELSE
        RAISE EXCEPTION 'Nessuna organizzazione trovata! Crea prima un utente.';
    END IF;
END $$;

-- 4. RESET POLICY DI SICUREZZA (RLS) - Per essere sicuri al 100%
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Transactions" ON public.transactions;
CREATE POLICY "Org Members Transactions" ON public.transactions
FOR ALL USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Coops" ON public.coops;
CREATE POLICY "Org Members Coops" ON public.coops
FOR ALL USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- Fix per le Galline (Hens)
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
