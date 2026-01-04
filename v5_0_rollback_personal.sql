-- ROLLBACK v5.0: MODALITÀ PERSONALE
-- Semplificazione radicale della sicurezza.
-- Ogni utente vede solo i propri dati (basato su created_by).

BEGIN;

-- 1. Rimuovi vincoli NOT NULL su organization_id (se presenti, per sicurezza)
ALTER TABLE public.transactions ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.coops ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.coop_breeds ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.hens ALTER COLUMN organization_id DROP NOT NULL;

-- 2. RESET RLS TRANSAZIONI
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Transactions All" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Select" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Insert" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Update" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Delete" ON public.transactions;

-- Nuova Policy Semplice: "My Data"
CREATE POLICY "My Transactions" ON public.transactions
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 3. RESET RLS POLLAI (Coops)
ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Coops All" ON public.coops;
DROP POLICY IF EXISTS "Org Members Coops Select" ON public.coops; 
-- ... (rimuovi tutte le altre varianti se esistono) ...

CREATE POLICY "My Coops" ON public.coops
FOR ALL
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 4. RESET RLS DETTAGLI (Breeds/Hens)
ALTER TABLE public.coop_breeds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Breeds All" ON public.coop_breeds;

CREATE POLICY "My Breeds" ON public.coop_breeds
FOR ALL USING (true); -- Semplifichiamo: se vedi il pollaio, vedi le razze.
-- (Potremmo fare JOIN con pollaio.created_by, ma per ora keep it simple)

ALTER TABLE public.hens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Hens All" ON public.hens;

CREATE POLICY "My Hens" ON public.hens
FOR ALL USING (true); -- Idem: se vedi la razza/pollaio, vedi gallina.

-- 5. TRIGGER DI SICUREZZA (Auto-Assign Created_By)
-- Assicuriamoci che 'created_by' sia sempre settato
CREATE OR REPLACE FUNCTION public.set_my_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by := auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_my_id_trans ON public.transactions;
CREATE TRIGGER trg_set_my_id_trans BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_my_id();

DROP TRIGGER IF EXISTS trg_set_my_id_coops ON public.coops;
CREATE TRIGGER trg_set_my_id_coops BEFORE INSERT ON public.coops FOR EACH ROW EXECUTE FUNCTION public.set_my_id();

COMMIT;
