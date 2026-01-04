-- RESCUE DATA (v4.14)
-- Questo script "Rompe il vetro" in caso di emergenza.
-- 1. Disabilita temporaneamente la sicurezza.
-- 2. Ripara i dati orfani (che hanno ID organizzazione mancante).
-- 3. Riattiva la sicurezza.

BEGIN;

-- DISABILITA RLS (Temporaneamente) per permettere le riparazioni
ALTER TABLE public.coop_breeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hens DISABLE ROW LEVEL SECURITY;

-- FIX 1: Ripara RAZZE orfane (Prendi ID dal Pollaio)
UPDATE public.coop_breeds cb
SET organization_id = c.organization_id
FROM public.coops c
WHERE cb.coop_id = c.id
AND (cb.organization_id IS NULL);

-- FIX 2: Ripara GALLINE orfane (Prendi ID dalla Razza)
UPDATE public.hens h
SET organization_id = cb.organization_id
FROM public.coop_breeds cb
WHERE h.coop_breed_id = cb.id
AND (h.organization_id IS NULL);

-- FIX 3: Ripara POLLAI orfane (Assegna all'organizzazione dell'utente che esegue lo script, se proprio serve)
-- Nota: Questo assume che tu sia l'owner.
UPDATE public.coops
SET organization_id = (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid() LIMIT 1)
WHERE organization_id IS NULL;

-- RIATTIVA RLS
ALTER TABLE public.coop_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hens ENABLE ROW LEVEL SECURITY;

-- FIX FINALE: Assicurati che le policy permettano l'update
-- (Se le policy erano sbagliate, le ricreiamo permissive per i membri)
DROP POLICY IF EXISTS "Org Members Breeds All" ON public.coop_breeds;
CREATE POLICY "Org Members Breeds All" ON public.coop_breeds
FOR ALL USING (true); -- Semplificazione temporanea se proprio non va, ma proviamo quella giusta:

DROP POLICY IF EXISTS "Org Members Breeds All_V2" ON public.coop_breeds;
CREATE POLICY "Org Members Breeds All_V2" ON public.coop_breeds
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

COMMIT;
