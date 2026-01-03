import { supabase } from './supabaseClient';

export const transactionService = {
    /**
     * Fetch all transactions ordered by date descending
     */
    async getTransactions() {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

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
     * Get statistics (this logic might stay in frontend for simplicity or use DB aggregation)
     * For now we fetch all and aggregate in frontend for < 1000 items is fine.
     */
};
