-- INVENTORY & COST CENTERS SCHEMA (v6.0)
-- Gestione Prodotti e Centri di Costo (Pollai)

BEGIN;

-- 1. TABELLA PRODOTTI (Products)
-- Catalogo semplice per velocizzare l'inserimento
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL, -- es. "Mais 25kg"
    default_price numeric(10,2), -- Prezzo suggerito
    unit text DEFAULT 'pz', -- pz, kg, sacco
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 2. AGGIORNAMENTO TRANSAZIONI
-- Aggiungiamo il collegamento al Pollaio (Centro di Costo)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS coop_id uuid REFERENCES public.coops(id);

-- 3. TABELLA DETTAGLI TRANSAZIONE (Items)
-- Per salvare cosa ho comprato esattamente
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id),
    quantity numeric(10,2) NOT NULL DEFAULT 1,
    unit_price numeric(10,2) NOT NULL DEFAULT 0,
    subtotal numeric(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at timestamptz DEFAULT now()
);

-- 4. SICUREZZA (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Products Policy
CREATE POLICY "My Products" ON public.products
FOR ALL USING (created_by = auth.uid());

-- Items Policy (Basato sulla transazione madre o ownership diretta se aggiungessimo created_by)
-- Per semplicità, qui usiamo una policy che verifica l'accesso alla transazione padre
-- Ma PostgreSQL RLS su join può essere complesso. 
-- Semplifichiamo aggiungendo created_by anche qui per performance e chiarezza RLS
ALTER TABLE public.transaction_items 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid();

CREATE POLICY "My Items" ON public.transaction_items
FOR ALL USING (created_by = auth.uid());

COMMIT;
