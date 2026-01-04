import { supabase } from './supabaseClient';

export const transactionService = {
    /**
     * Fetch all transactions ordered by date descending
     */
    async getTransactions() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*, profiles:created_by(first_name, last_name), customers(name), suppliers(name)')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
        return data;
    },

    /**
     * Add a new transaction
     * @param {Object} transaction 
     */
    async addTransaction(transaction) {
        if (!transaction.organization_id) {
            console.warn("Adding transaction without organization_id");
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction])
            .select()
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
        return data;
    },

    /**
     * Delete a transaction by ID
     * @param {string} id 
     */
    async deleteTransaction(id) {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },

    /**
     * Get a single transaction by ID
     * @param {string} id 
     */
    async getTransactionById(id) {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles:created_by(first_name, last_name),
                transaction_items (
                    id,
                    product_id,
                    quantity,
                    unit_price,
                    subtotal,
                    products ( id, name, unit )
                ),
                coops ( name )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching transaction:', error);
            throw error;
        }
        return data;
    },

    /**
     * Update an existing transaction
     * @param {string} id 
     * @param {Object} updates 
     */
    async updateTransaction(id, updates) {
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
        return data;
    },

    /**
     * Get statistics (this logic might stay in frontend for simplicity or use DB aggregation)
     * For now we fetch all and aggregate in frontend for < 1000 items is fine.
     */
};
