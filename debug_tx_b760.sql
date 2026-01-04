-- Inspect the specific transaction b760998f...
SELECT 
    t.id as tx_id, 
    t.date,
    t.created_at as tx_created_at,
    t.created_by as tx_owner, 
    ti.id as item_id, 
    ti.product_id, 
    ti.quantity, 
    ti.created_by as item_owner
FROM public.transactions t
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
WHERE t.id = 'b760998f-a0ef-4148-82c6-8d4e87dca991';
