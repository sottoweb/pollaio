-- FIX RLS (v4.8)
-- Risolve il problema "new row violates row-level security policy".
-- Spesso causato dal fatto che l'utente non può "leggere" la propria membership per confermare di far parte dell'organizzazione.

-- 1. Assicuriamo lettura su organization_members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;
CREATE POLICY "Users can view own membership" ON public.organization_members
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Ricreiamo policy Coops in modo esplicito
ALTER TABLE public.coops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Coops" ON public.coops;

CREATE POLICY "Org Members Coops Select" ON public.coops
FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Coops Insert" ON public.coops
FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Coops Update" ON public.coops
FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org Members Coops Delete" ON public.coops
FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- 3. Stessa cosa per Transactions (per sicurezza)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Org Members Transactions" ON public.transactions;

CREATE POLICY "Org Members Transactions All" ON public.transactions
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);
