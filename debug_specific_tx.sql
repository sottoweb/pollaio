-- Inspect the specific transaction and any potential items
SELECT 
    t.id as tx_id, 
    t.created_by as tx_owner, 
    ti.id as item_id, 
    ti.product_id, 
    ti.quantity, 
    ti.created_by as item_owner
FROM public.transactions t
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
WHERE t.id = '3baa7b0d-52a2-4c1a-955f-6e54c6a7e188';
