UPDATE public.transaction_items 
SET created_by = (
    SELECT t.created_by 
    FROM public.transactions t 
    WHERE t.id = public.transaction_items.transaction_id
)
WHERE created_by IS NULL;
