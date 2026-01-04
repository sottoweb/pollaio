-- RESET DATI DI PROVA (CLEAN SLATE)
-- Cancella transazioni, pollai, galline e inviti.
-- Mantiene utenti e organizzazioni per non dover rifare il login.

BEGIN;

-- Svuota tabelle con riferimenti a cascata
TRUNCATE TABLE public.transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.hens RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.coop_breeds RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.coops RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.invitations RESTART IDENTITY CASCADE;

COMMIT;
