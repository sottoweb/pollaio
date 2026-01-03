-- Create the transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  date date not null,
  category text not null,
  eggs_count integer, -- Nullable, only for income
  description text
);

-- Set up Row Level Security (RLS)
-- For a simple app without auth login, we might need to disable RLS or allow public access.
-- Since the user asked for "simple", let's assume public access for now BUT 
-- standard Supabase practice is to enable RLS. 
-- However, without Auth implemented, we need to allow anon access.

alter table public.transactions enable row level security;

create policy "Enable read access for all users"
on public.transactions
for select
to anon
using (true);

create policy "Enable insert access for all users"
on public.transactions
for insert
to anon
with check (true);

create policy "Enable delete access for all users"
on public.transactions
for delete
to anon
using (true);

-- Create an index on date for faster sorting/filtering
create index transactions_date_idx on public.transactions (date);
