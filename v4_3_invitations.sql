-- MIGRATION v4.3: GESTIONE INVITI

-- 1. Tabella Inviti
CREATE TABLE public.invitations (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  token uuid default gen_random_uuid() not null, -- Il segreto per il link
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  status text default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indice per lookup veloce del token
CREATE INDEX idx_invitations_token ON public.invitations(token);

-- 2. RLS su Inviti
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Visibile ai membri dell'organizzazione (per vedere chi è stato invitato)
CREATE POLICY "Org Members View Invitations" ON public.invitations
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- Creazione inviti: Solo membri (o restringere a admin/owner se volessimo)
CREATE POLICY "Org Members Create Invitations" ON public.invitations
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);

-- Cancellazione inviti: Solo membri
CREATE POLICY "Org Members Delete Invitations" ON public.invitations
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
);
