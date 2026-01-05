-- Check count
SELECT count(*) FROM public.transactions;

-- Force clean with TRUNCATE (Bypasses RLS)
TRUNCATE TABLE public.transactions CASCADE;

-- Check count again
SELECT count(*) FROM public.transactions;
