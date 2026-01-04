-- FIX CUMULATIVO FINALE (v4.10)
-- Esegui questo script UNICO per risolvere tutti i problemi di permesso e schema.

BEGIN;

-- 1. FIX SCHEMA: Aggiungi colonna capienza pollai (se manca)
ALTER TABLE public.coops 
ADD COLUMN IF NOT EXISTS max_capacity integer DEFAULT 0;

-- 2. FIX RLS MEMBERSHIP: Permetti agli utenti di leggere la propria appartenenza
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;
CREATE POLICY "Users can view own membership" ON public.organization_members
FOR SELECT
USING (auth.uid() = user_id);

-- 3. FIX RLS POLLAI (Coops): Policy esplicite
ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Coops" ON public.coops;
DROP POLICY IF EXISTS "Org Members Coops Select" ON public.coops;
DROP POLICY IF EXISTS "Org Members Coops Insert" ON public.coops;
DROP POLICY IF EXISTS "Org Members Coops Update" ON public.coops;
DROP POLICY IF EXISTS "Org Members Coops Delete" ON public.coops;
DROP POLICY IF EXISTS "Org Members Coops All" ON public.coops;

CREATE POLICY "Org Members Coops All" ON public.coops
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- 4. FIX RLS TRANSAZIONI: Policy esplicite
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Transactions All" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Select" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Insert" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Update" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Transactions Delete" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Select" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Insert" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Update" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Delete" ON public.transactions;

CREATE POLICY "Org Members Transactions All" ON public.transactions
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

COMMIT;
