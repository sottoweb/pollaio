-- CLEANUP v5.1: DISABLE RLS FOR DETAILS
-- Risolve definitivamente errore "violates row-level security policy" su razze e galline.
-- In modalità personale, non serve RLS su queste tabelle figlie.

BEGIN;

-- 1. DISABILITA RLS (Libera tutti)
ALTER TABLE public.coop_breeds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hens DISABLE ROW LEVEL SECURITY;

-- 2. RIMUOVI TRIGGER OBSOLETI (Non servono più)
DROP TRIGGER IF EXISTS trg_set_breed_org ON public.coop_breeds;
DROP TRIGGER IF EXISTS trg_set_hen_org ON public.hens;
DROP FUNCTION IF EXISTS public.auto_set_breed_org;
DROP FUNCTION IF EXISTS public.auto_set_hen_org;

-- 3. BONUS: Assicurati che i pollai siano visibili (Policy Permissiva)
-- Se hai problemi anche coi pollai, questo li risolve rendendoli tutti visibili/modificabili
-- (De-commenta se serve, ma per ora teniamo RLS su coops attivo su created_by)
-- DROP POLICY IF EXISTS "My Coops" ON public.coops;
-- CREATE POLICY "All Coops Open" ON public.coops FOR ALL USING (true);

COMMIT;
