-- ESEGUI QUESTO SCRIPT NELL'EDITOR SQL DI SUPABASE
-- Risolve i problemi di salvataggio prodotti e permessi

BEGIN;

-- 1. Aggiunge le colonne mancanti (se non ci sono)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Sistema i permessi della tabella prodotti (TUTTI gli utenti loggati possono modificare)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Rimuove vecchie policy che potrebbero bloccare
DROP POLICY IF EXISTS "My Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Authenticated" ON public.products;
DROP POLICY IF EXISTS "products_access_policy" ON public.products;

-- Crea la policy permissiva
CREATE POLICY "products_access_policy" ON public.products
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Sistema i permessi per le Foto (Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_access_policy" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users can update their product images" ON storage.objects;

-- Permetti upload e modifica agli utenti
CREATE POLICY "storage_access_policy" ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Permetti a tutti di vedere le foto
DROP POLICY IF EXISTS "public_view_policy" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;

CREATE POLICY "public_view_policy" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

COMMIT;
