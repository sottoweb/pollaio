SELECT 
    t.id as transaction_id, 
    t.date, 
    t.amount, 
    t.created_by as tx_creator, 
    ti.id as item_id, 
    ti.created_by as item_creator, 
    ti.product_id,
    p.name as product_name
FROM public.transactions t
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
LEFT JOIN public.products p ON ti.product_id = p.id
ORDER BY t.date DESC
LIMIT 10;
