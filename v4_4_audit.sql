-- MIGRATION v4.4: AUDIT TRAIL & PERMISSIONS

-- 1. Aggiungi colonna `created_by` alle tabelle principali
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.coops 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

ALTER TABLE public.hens 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

-- 2. Popola i dati esistenti (Assegna all'Owner)
-- Cerchiamo l'owner dell'organizzazione e assegniamo tutto a lui per evitare null
DO $$
DECLARE
    owner_id uuid;
    org_id uuid;
BEGIN
    -- Prendi la prima org e il suo owner (semplificazione per migrazione mono-tenant -> multi-tenant)
    SELECT id, owner_id INTO org_id, owner_id FROM public.organizations LIMIT 1;
    
    IF owner_id IS NOT NULL THEN
        UPDATE public.transactions SET created_by = owner_id WHERE created_by IS NULL;
        UPDATE public.coops SET created_by = owner_id WHERE created_by IS NULL;
        UPDATE public.hens SET created_by = owner_id WHERE created_by IS NULL;
    END IF;
END $$;

-- 3. Trigger automatico per `created_by` (Opzionale ma utile)
-- Se il frontend non lo manda, lo mette il DB prelevandolo da auth.uid()
CREATE OR REPLACE FUNCTION set_created_by()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applica trigger
DROP TRIGGER IF EXISTS trg_transactions_created_by ON public.transactions;
CREATE TRIGGER trg_transactions_created_by
BEFORE INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION set_created_by();

DROP TRIGGER IF EXISTS trg_coops_created_by ON public.coops;
CREATE TRIGGER trg_coops_created_by
BEFORE INSERT ON public.coops
FOR EACH ROW EXECUTE FUNCTION set_created_by();

DROP TRIGGER IF EXISTS trg_hens_created_by ON public.hens;
CREATE TRIGGER trg_hens_created_by
BEFORE INSERT ON public.hens
FOR EACH ROW EXECUTE FUNCTION set_created_by();
