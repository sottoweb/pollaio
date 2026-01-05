-- Clear all transactions
-- This will automatically cascade to delete 'transaction_items' due to the foreign key constraint.
DELETE FROM public.transactions;

-- Note: We are NOT deleting:
-- - public.coops (Pollai)
-- - public.products (Prodotti/Listino)
-- - public.customers / public.suppliers (Anagrafiche)
-- - auth.users / public.profiles (Utenti)
