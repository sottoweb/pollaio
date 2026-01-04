-- MIGRAZIONE DATI (v4.2)
-- Assegna i vecchi dati (orfani) alla nuova organizzazione

-- 1. Aggiungi Colonna organization_id
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

ALTER TABLE public.coops 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 2. Assegna i dati orfani alla PRIMA organizzazione trovata nel DB
-- (Presumiamo che l'utente si sia appena registrato e sia l'unico/primo)
DO $$
DECLARE
    target_org_id uuid;
BEGIN
    SELECT id INTO target_org_id FROM public.organizations LIMIT 1;

    IF target_org_id IS NOT NULL THEN
        -- Aggiorna Transazioni
        UPDATE public.transactions 
        SET organization_id = target_org_id 
        WHERE organization_id IS NULL;
        
        -- Aggiorna Pollai
        UPDATE public.coops 
        SET organization_id = target_org_id 
        WHERE organization_id IS NULL;
        
        RAISE NOTICE 'Dati migrati con successo verso Org: %', target_org_id;
    ELSE
        RAISE NOTICE 'Nessuna Organizzazione trovata. Crea prima un utente e organizzazione.';
    END IF;
END $$;

-- 3. AGGIORNAMENTO SICUREZZA (RLS)
-- Ora che i dati hanno un padrone, chiudiamo le porte.

-- TRANSAZIONI
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.transactions;

CREATE POLICY "Org Members Select Transactions" ON public.transactions
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Insert Transactions" ON public.transactions
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Update Transactions" ON public.transactions
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Delete Transactions" ON public.transactions
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);


-- POLLAI (Coops)
ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.coops;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.coops;
-- Drop altre vecchie policy se esistono...

CREATE POLICY "Org Members Select Coops" ON public.coops
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Insert Coops" ON public.coops
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Update Coops" ON public.coops
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Delete Coops" ON public.coops
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);


-- RAZZE E GALLINE (Accesso tramite Pollaio Padre)
ALTER TABLE public.coop_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hens ENABLE ROW LEVEL SECURITY;

-- Policy per coop_breeds (Check parent coop)
CREATE POLICY "Org Members Access Breeds" ON public.coop_breeds
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.coops 
        WHERE id = coop_breeds.coop_id 
        AND organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);

-- Policy per hens (Check parent coop)
CREATE POLICY "Org Members Access Hens" ON public.hens
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.coops 
        WHERE id = hens.coop_id 
        AND organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
        )
    )
);
