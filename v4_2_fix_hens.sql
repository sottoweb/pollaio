-- FIX POLICY GALLINE (v4.2.1)
-- L'errore era dovuto al fatto che 'hens' non ha 'coop_id' diretto, ma 'breed_id'.

-- 1. Elimina la policy errata se è stata creata parzialmente
drop policy if exists "Org Members Hens" on public.hens;

-- 2. Ricrea la policy passando per la tabella 'coop_breeds'
create policy "Org Members Hens" on public.hens
for all using (
    exists (
        select 1 from public.coop_breeds cb
        join public.coops c on c.id = cb.coop_id
        where cb.id = hens.coop_breed_id
        and c.organization_id in (
            select organization_id from public.organization_members where user_id = auth.uid()
        )
    )
);

-- 3. Verifica per 'coop_breeds' (giusto per sicurezza)
drop policy if exists "Org Members Breeds" on public.coop_breeds;

create policy "Org Members Breeds" on public.coop_breeds 
for all using (
    exists (
        select 1 from public.coops c
        where c.id = coop_breeds.coop_id 
        and c.organization_id in (
            select organization_id from public.organization_members where user_id = auth.uid()
        )
    )
);
