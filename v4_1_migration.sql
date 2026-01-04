-- MIGRATION v4.1: DETTAGLI AZIENDALI

-- 1. Aggiunta colonne alla tabella ORGANIZATIONS
alter table public.organizations 
add column if not exists address text,
add column if not exists city text,
add column if not exists zip_code text,
add column if not exists country text default 'Italia',
add column if not exists vat_number text, -- Partita IVA
add column if not exists tax_code text, -- Codice Fiscale
add column if not exists phone text,
add column if not exists email_business text,
add column if not exists website text,
add column if not exists logo_url text;

-- 2. Bucket per i Loghi Aziendali
-- Nota: Devi creare il bucket 'company-logos' manualmente dalla Dashboard se lo script non va, 
-- ma proviamo a inserire il record se Supabase lo permette via SQL (spesso serve farlo da UI).

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

-- Policy per vedere i loghi (Pubblico)
create policy "Logos are public"
on storage.objects for select
using ( bucket_id = 'company-logos' );

-- Policy per caricare loghi (Solo autenticati)
create policy "Auth users can upload logos"
on storage.objects for insert
with check ( bucket_id = 'company-logos' and auth.role() = 'authenticated' );

-- Policy per modificare (Solo owner/membri dell'org - semplificato per ora a auth users)
create policy "Auth users can update logos"
on storage.objects for update
using ( bucket_id = 'company-logos' and auth.role() = 'authenticated' );

-- Policy per cancellare
create policy "Auth users can delete logos"
on storage.objects for delete
using ( bucket_id = 'company-logos' and auth.role() = 'authenticated' );
