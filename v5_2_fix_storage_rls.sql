-- FIX STORAGE RLS (v5.2)
-- Sblocca il caricamento delle immagini nel bucket 'breed-images'.
-- Il problema era che la "Guardia" bloccava anche il salvataggio delle foto.

BEGIN;

-- 1. Assicura che il bucket esista e sia pubblico
INSERT INTO storage.buckets (id, name, public)
VALUES ('breed-images', 'breed-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Rimuovi vecchie policy che potrebbero bloccare
-- (Le cancelliamo tutte per questo bucket specifico per sicurezza)
DROP POLICY IF EXISTS "Public View Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users Manage Images" ON storage.objects;
DROP POLICY IF EXISTS "Org Members Select" ON storage.objects;
DROP POLICY IF EXISTS "Org Members Insert" ON storage.objects;
DROP POLICY IF EXISTS "Org Members Update" ON storage.objects;
DROP POLICY IF EXISTS "Org Members Delete" ON storage.objects;

-- 3. Nuove Policy Semplici (Modalità Personale)

-- TUTTI possono vedere le immagini (così appaiono nel sito)
CREATE POLICY "Public View Images" ON storage.objects
FOR SELECT USING ( bucket_id = 'breed-images' );

-- UTENTI AUTENTICATI possono fare tutto (Caricare, Sostituire, Cancellare)
CREATE POLICY "Auth Users Manage Images" ON storage.objects
FOR ALL
USING (
    bucket_id = 'breed-images' 
    AND auth.role() = 'authenticated'
)
WITH CHECK (
    bucket_id = 'breed-images' 
    AND auth.role() = 'authenticated'
);

COMMIT;
