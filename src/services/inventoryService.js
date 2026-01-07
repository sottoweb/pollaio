import { supabase } from './supabaseClient';
import { transactionService } from './transactionService';

export const inventoryService = {
    // --- PRODUCTS ---

    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            // Order by priority (manual importance) first, then alphabetically
            .order('priority', { ascending: false })
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addProduct(name, default_price = 0, unit = 'pz', description = '', image_url = null, priority = 0) {
        // window.alert(`Tentativo creazione: ${name}`);
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{ name, default_price, unit, description, image_url, priority: priority || 0 }])
                .select();

            if (error) {
                window.alert(`ERRORE DB INSERT: ${error.message}`);
                throw error;
            }

            if (!data || data.length === 0) {
                window.alert("ATTENZIONE: Nessun dato ritornato dopo l'insert. Ricarica la pagina.");
                return null;
            }

            // window.alert("Prodotto creato con successo (DB)!");
            return data[0];
        } catch (e) {
            window.alert(`ECCEZIONE INSERT: ${e.message}`);
            throw e;
        }
    },

    async updateProduct(id, updates) {
        console.log("updateProduct called with:", id, updates);
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error("updateProduct error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn("updateProduct: No rows returned immediately. Attempting manual refetch...");
            const { data: refetched, error: fetchError } = await supabase.from('products').select('*').eq('id', id).single();

            if (fetchError) console.error("Refetch error:", fetchError);
            if (refetched) {
                console.log("updateProduct: Recovered data via refetch:", refetched);
                return refetched;
            }

            console.warn("updateProduct: Refetch failed too. Assuming success with optimistic return.");
            return { id, ...updates };
        }

        console.log("updateProduct success:", data[0]);
        return data[0];
    },

    async deleteProduct(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async uploadProductImage(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // --- STOCK LOADING (SPLIT-ON-SAVE) ---
    // Takes a list of items: [{ product, qty, price, coop_id }]
    // And creates necessary transactions
    async saveStockLoad(items, date, supplier_id) {
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
