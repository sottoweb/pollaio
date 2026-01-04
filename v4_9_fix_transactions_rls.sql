-- FIX RLS TRANSACTIONS (v4.9)
-- Rende esplicite le policy per la tabella transactions, come fatto per coops.

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org Members Transactions All" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Select" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Insert" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Update" ON public.transactions;
DROP POLICY IF EXISTS "Org Members Delete" ON public.transactions;

-- SELECT
CREATE POLICY "Org Members Transactions Select" ON public.transactions
FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- INSERT
CREATE POLICY "Org Members Transactions Insert" ON public.transactions
FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- UPDATE
CREATE POLICY "Org Members Transactions Update" ON public.transactions
FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- DELETE
CREATE POLICY "Org Members Transactions Delete" ON public.transactions
FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);
