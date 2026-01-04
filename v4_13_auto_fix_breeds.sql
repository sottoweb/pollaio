-- FIX AUTO-POPULATE ORG ID (v4.13)
-- Questo script è la "cintura di sicurezza" definitiva.
-- Se il frontend dimentica l'ID Organizzazione, il Database lo recupera da solo dal Pollaio.

BEGIN;

-- 1. Funzione Trigger: Prende Org ID dal Pollaio padre
CREATE OR REPLACE FUNCTION public.auto_set_breed_org()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.organization_id IS NULL THEN
        SELECT organization_id INTO NEW.organization_id
        FROM public.coops
        WHERE id = NEW.coop_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger su COOP_BREEDS
DROP TRIGGER IF EXISTS trg_set_breed_org ON public.coop_breeds;
CREATE TRIGGER trg_set_breed_org
BEFORE INSERT ON public.coop_breeds
FOR EACH ROW EXECUTE FUNCTION public.auto_set_breed_org();

-- 3. Funzione Trigger: Prende Org ID dalla Razza padre (per le Galline)
CREATE OR REPLACE FUNCTION public.auto_set_hen_org()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.organization_id IS NULL THEN
        SELECT organization_id INTO NEW.organization_id
        FROM public.coop_breeds
        WHERE id = NEW.coop_breed_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger su HENS
DROP TRIGGER IF EXISTS trg_set_hen_org ON public.hens;
CREATE TRIGGER trg_set_hen_org
BEFORE INSERT ON public.hens
FOR EACH ROW EXECUTE FUNCTION public.auto_set_hen_org();

-- 5. FIX DATI ESISTENTI (Backfill)
-- Aggiorna tutte le razze esistenti prendendo l'ID dai loro pollai
UPDATE public.coop_breeds cb
SET organization_id = c.organization_id
FROM public.coops c
WHERE cb.coop_id = c.id
AND cb.organization_id IS NULL;

-- Aggiorna tutte le galline esistenti prendendo l'ID dalle loro razze
UPDATE public.hens h
SET organization_id = cb.organization_id
FROM public.coop_breeds cb
WHERE h.coop_breed_id = cb.id
AND h.organization_id IS NULL;

COMMIT;
