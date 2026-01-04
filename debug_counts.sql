SELECT t.id, t.date, t.amount, count(ti.id) as item_count 
FROM public.transactions t 
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
GROUP BY t.id, t.date, t.amount
ORDER BY t.date DESC
LIMIT 5;
