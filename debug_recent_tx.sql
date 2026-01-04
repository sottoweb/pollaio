-- Check the last 3 transactions and their item counts/details
SELECT 
    t.id as tx_id, 
    t.date,
    t.amount,
    c.name as coop_name,
    count(ti.id) as item_count,
    string_agg(p.name, ', ') as products
FROM public.transactions t
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
LEFT JOIN public.products p ON ti.product_id = p.id
LEFT JOIN public.coops c ON t.coop_id = c.id
GROUP BY t.id, t.date, t.amount, c.name
ORDER BY t.created_at DESC
LIMIT 3;
