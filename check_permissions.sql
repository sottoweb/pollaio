-- DIAGNOSTICA PERMESSI (Check Stato)
-- Esegui questo script e controlla i RISULTATI (in basso a destra su Supabase)
-- Ti dirà se le policy e le colonne sono attive.

BEGIN;

-- 1. Controlla se la colonna organization_id esiste in coop_breeds
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='coop_breeds' AND column_name='organization_id') THEN
        RAISE NOTICE '⚠️ ERRORE GRAVE: Manca colonna organization_id in coop_breeds!';
    ELSE
        RAISE NOTICE '✅ Colonna coop_breeds.organization_id presente.';
    END IF;
END $$;

-- 2. Controlla se RLS è attivo su coop_breeds
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'coop_breeds' AND rowsecurity = true) THEN
        RAISE NOTICE '⚠️ RLS disattivato su coop_breeds!';
    ELSE
        RAISE NOTICE '✅ RLS attivo su coop_breeds.';
    END IF;
END $$;

-- 3. Controlla la tua membership
-- Sostituisci il TUO UUID qui sotto se vuoi testare specificamente, altrimenti è generico
SELECT auth.uid() as user_id, organization_id, role 
FROM public.organization_members 
WHERE user_id = auth.uid();

-- 4. Controlla se esistono policy su coop_breeds
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'coop_breeds';

COMMIT;
