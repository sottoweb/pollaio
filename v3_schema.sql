-- TABLES FOR V3.0: COOPS & HENS

-- 1. Pollai (Coops)
create table public.coops (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text
);

-- 2. Razze nel Pollaio (Coop Breeds)
create table public.coop_breeds (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  coop_id uuid references public.coops(id) on delete cascade not null,
  breed_name text not null,
  image_url text,
  total_count integer default 0 check (total_count >= 0)
);

-- 3. Singole Galline (Hens)
create table public.hens (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  coop_breed_id uuid references public.coop_breeds(id) on delete cascade not null,
  name_id text, -- ID o Nome (es. "001" o "Rosina")
  birth_date date,
  notes text
);

-- RLS POLICIES (Allow all for anon users)

-- Coops
alter table public.coops enable row level security;
create policy "Enable all access for coops" on public.coops for all to anon using (true) with check (true);

-- Coop Breeds
alter table public.coop_breeds enable row level security;
create policy "Enable all access for coop_breeds" on public.coop_breeds for all to anon using (true) with check (true);

-- Hens
alter table public.hens enable row level security;
create policy "Enable all access for hens" on public.hens for all to anon using (true) with check (true);

-- STORAGE POLICIES (To be run after creating 'breed-images' bucket)
-- NOTE: You must create the bucket 'breed-images' manually in Supabase Storage dashboard first!

-- Policy to allow public viewing of images
-- create policy "Public Access" on storage.objects for select using ( bucket_id = 'breed-images' );

-- Policy to allow upload for anon users
-- create policy "Anon Upload" on storage.objects for insert with check ( bucket_id = 'breed-images' );
