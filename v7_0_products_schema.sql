-- PHASE 7: ENHANCED PRODUCTS SCHEMA
-- Aggiunge supporto per descrizioni e immagini ai prodotti

BEGIN;

-- 1. Aggiornamento Tabella Products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Setup Storage (Idempotente)
-- Inserisce il bucket se non esiste
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Policy Storage
-- Permetti upload agli utenti autenticati per il bucket product-images
CREATE POLICY "Auth Users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Permetti update/delete (opzionale, per ora insert basta per il MVP, 
-- ma aggiungiamo update per modificare i prodotti)
CREATE POLICY "Auth Users can update their product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images'); -- Semplificato, ideale sarebbe check owner

-- Permetti lettura a tutti (bucket pubblico)
CREATE POLICY "Public Access Product Images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

COMMIT;
