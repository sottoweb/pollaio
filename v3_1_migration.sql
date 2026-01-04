-- MIGRATION v3.1: Aggiunta dettagli Galline

-- 1. Aggiungi colonne alla tabella 'hens'
alter table public.hens 
add column if not exists provenance text, -- Provenienza (es. Allevamento X)
add column if not exists sex text default 'F' check (sex in ('M', 'F')); -- M = Gallo, F = Gallina

-- Nota: La data di nascita (birth_date) esiste già.
