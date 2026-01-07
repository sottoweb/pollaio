-- COPIA TUTTO QUESTO E ESEGUILO NELL'EDITOR SQL DI SUPABASE
-- Questo aggiunge le colonne mancanti per le foto e le descrizioni

BEGIN;

-- 1. Aggiungi colonne se mancano
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Assicurati che il bucket per le immagini esista
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Aggiorna le policy di sicurezza per le immagini
DROP POLICY IF EXISTS "Auth Users can upload product images" ON storage.objects;
CREATE POLICY "Auth Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

COMMIT;
