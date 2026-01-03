-- FIX: Aggiunta policy mancante per l'aggiornamento (UPDATE)
-- Senza questa policy, Supabase blocca le modifiche e restituisce errore 406.

create policy "Enable update access for all users"
on public.transactions
for update
to anon
using (true)
with check (true);
