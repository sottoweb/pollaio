-- SCHEMA v4.0: AUTH & ORGANIZATIONS

-- 1. PROFILES (Estende auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Trigger per creare automaticamente il profilo alla registrazione
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name)
  values (new.id, new.email, new.raw_user_meta_data->>'first_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. ORGANIZATIONS (Aziende/Allevamenti)
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  owner_id uuid references public.profiles(id) not null
);

-- 3. MEMBERS (Chi fa parte di quale org)
create table public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- RLS POLICIES (Fondamenta)
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Profiles: Ognuno legge/modifica il suo
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Organizations: Visibili ai membri
create policy "Members can view organizations" on public.organizations 
  for select using (
    exists (
      select 1 from public.organization_members 
      where organization_id = organizations.id 
      and user_id = auth.uid()
    )
  );

-- Members: Visibili ai membri dello stesso team
create policy "Members can view detail" on public.organization_members
  for select using (
    exists (
      select 1 from public.organization_members as m
      where m.organization_id = organization_members.organization_id
      and m.user_id = auth.uid()
    )
  );
