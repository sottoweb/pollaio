import { supabase } from './supabaseClient';
import { transactionService } from './transactionService';

export const inventoryService = {
    // --- PRODUCTS ---

    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addProduct(name, default_price = 0, unit = 'pz') {
        const { data, error } = await supabase
            .from('products')
            .insert([{ name, default_price, unit }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- STOCK LOADING (SPLIT-ON-SAVE) ---
    // Takes a list of items: [{ product, qty, price, coop_id }]
    // And creates necessary transactions
    async saveStockLoad(items, date, supplier_id) {
        // ... (existing logic)
        // 1. Group items by coop_id (null = Generals)
        const groups = items.reduce((acc, item) => {
            const key = item.coop_id || 'general';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        const results = [];

        // 2. Create a transaction for each group
        for (const [key, groupItems] of Object.entries(groups)) {
            const coopId = key === 'general' ? null : key;

            // Calculate total for this transaction
            const totalAmount = groupItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

            // Create Transaction Parent
            const transactionRecord = {
                type: 'expense',
                category: 'MANGIME/SCORTA', // Default category for stock
                amount: totalAmount,
                date: date,
                supplier_id: supplier_id,
                coop_id: coopId,
            };

            const newTransaction = await transactionService.addTransaction(transactionRecord);
            if (newTransaction) {
                results.push(newTransaction);

                // 3. Create Item Details
                const { data: { user } } = await supabase.auth.getUser(); // Get current user
                const transactionItems = groupItems.map(item => ({
                    transaction_id: newTransaction.id,
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    created_by: user?.id
                }));

                const { error: itemsError } = await supabase
                    .from('transaction_items')
                    .insert(transactionItems);

                if (itemsError) {
                    console.error("Error saving items detail", itemsError);
                    // Non-blocking but serious
                }
            }
        }

        return results;
    },

    /**
     * Updates an existing transaction and its items.
     * Use this when editing a single transaction that already exists.
     * It does NOT split by coop (assumes all items belong to this transaction's coop).
     */
    async updateStockTransaction(transactionId, items, transactionData) {
        // 1. Update Parent Transaction
        await transactionService.updateTransaction(transactionId, transactionData);

        const { data: { user } } = await supabase.auth.getUser(); // Get current user for new items

        // 2. Sync Items
        // Strategy: Delete all existing items for this transaction and re-insert.
        // This is safer/easier than diffing for now, assuming low volume of items per receipt.

        // A. Delete old
        const { error: deleteError } = await supabase
            .from('transaction_items')
            .delete()
            .eq('transaction_id', transactionId);

        if (deleteError) throw deleteError;

        // B. Insert new
        if (items.length > 0) {
            const newItems = items.map(item => ({
                transaction_id: transactionId,
                product_id: item.product.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                created_by: user?.id // Ensure RLS compliance
            }));

            const { error: insertError } = await supabase
                .from('transaction_items')
                .insert(newItems);

            if (insertError) throw insertError;
        }
    }
};
