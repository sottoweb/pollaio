-- *** ISTRUZIONI IMPORTANTI ***
-- Purtroppo l'aggiornamento automatico del database non sta funzionando dal terminale.
-- Devi eseguire questo script MANUALMENTE per sbloccare la situazione.

-- 1. Vai su Supabase Dashboard: https://supabase.com/dashboard
-- 2. Seleziona il tuo progetto
-- 3. Clicca su "SQL Editor" nel menu laterale (icona con due terminali >_)
-- 4. Clicca su "New Query" (pulsante verde)
-- 5. COPIA E INCOLLA TUTTO il codice qui sotto
-- 6. Clicca "RUN" (in basso a destra)

BEGIN;

-- 1. Aggiunta colonne descrizione e immagine (se mancano)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Sblocco permessi modifica prodotti
-- Rimuoviamo vecchie restrizioni che impedivano il salvataggio
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "My Products" ON public.products;
DROP POLICY IF EXISTS "Allow All Authenticated" ON public.products;
DROP POLICY IF EXISTS "products_access_policy" ON public.products;

-- Nuova regola: Chiunque sia loggato può creare, modificare e vedere tutti i prodotti
CREATE POLICY "products_access_policy" ON public.products
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Configurazione Storage Immagini
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Reset permessi storage
DROP POLICY IF EXISTS "storage_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "Auth Users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;

-- Permetti caricamento e modifica immagini
CREATE POLICY "storage_upload_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "storage_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images');

-- Permetti a tutti di vedere le immagini
CREATE POLICY "storage_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

COMMIT;
