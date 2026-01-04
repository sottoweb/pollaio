-- CRM SCHEMA (v5.3)
-- Aggiunge gestione Clienti e Fornitori
-- + Collegamento nelle transazioni

BEGIN;

-- 1. TABELLA CLIENTI (Customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    notes text, -- eventuali note (es. "Prende sempre 30 uova")
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 2. TABELLA FORNITORI (Suppliers)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text, -- es. "Mangime", "Attrezzatura"
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- 3. AGGIORNAMENTO TRANSAZIONI
-- Aggiungiamo i riferimenti opzionali
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.customers(id),
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id);

-- 4. SICUREZZA (RLS) - SISTEMA PERSONALE
-- Attiviamo RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Policy Customers (Vedo solo i miei)
CREATE POLICY "My Customers" ON public.customers
FOR ALL USING (created_by = auth.uid());

-- Policy Suppliers (Vedo solo i miei)
CREATE POLICY "My Suppliers" ON public.suppliers
FOR ALL USING (created_by = auth.uid());

COMMIT;
