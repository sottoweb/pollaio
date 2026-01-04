-- FIX SCHEMA (v4.7)
-- Aggiunge la colonna mancante 'max_capacity' alla tabella coops.

ALTER TABLE public.coops 
ADD COLUMN IF NOT EXISTS max_capacity integer DEFAULT 0;
