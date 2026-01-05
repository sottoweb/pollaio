-- Check recent transactions specifically for coop_id and confirm coops table content
SELECT t.id, t.amount, t.coop_id, c.name as coop_name
FROM public.transactions t
LEFT JOIN public.coops c ON t.coop_id = c.id
ORDER BY t.created_at DESC
LIMIT 5;

-- Check policies on coops table (hacky way to see if table exists and is readable)
SELECT * FROM public.coops LIMIT 5;
