-- FUNZIONI GESTIONE INVITI (RPC) v4.3

-- 1. Funzione per leggere i dettagli invito (pubblica tramite token)
-- Serve al frontend per mostrare "Sei stato invitato da [NomeAzienda]"
create or replace function get_invite_details(lookup_token uuid)
returns json
language plpgsql
security definer -- Esegue come admin per bypassare RLS
as $$
declare
  result json;
begin
  select json_build_object(
    'email', i.email,
    'role', i.role,
    'company_name', o.name,
    'status', i.status
  ) into result
  from public.invitations i
  join public.organizations o on o.id = i.organization_id
  where i.token = lookup_token;
  
  if result is null then
     raise exception 'Invito non trovato';
  end if;

  return result;
end;
$$;

-- 2. Funzione per ACCETTARE l'invito
-- L'utente deve essere già loggato (auth.uid() presente)
create or replace function accept_invitation(lookup_token uuid)
returns void
language plpgsql
security definer
as $$
declare
  invite_record record;
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    raise exception 'Devi essere loggato per accettare.';
  end if;

  -- Cerca invito valido
  select * into invite_record 
  from public.invitations 
  where token = lookup_token;

  if invite_record.id is null then
    raise exception 'Invito non valido.';
  end if;

  if invite_record.status = 'accepted' then
    raise exception 'Invito già utilizzato.';
  end if;

  -- Aggiungi membro
  insert into public.organization_members (organization_id, user_id, role)
  values (invite_record.organization_id, current_user_id, invite_record.role);

  -- Marca invito come accettato
  update public.invitations 
  set status = 'accepted' 
  where id = invite_record.id;

end;
$$;
