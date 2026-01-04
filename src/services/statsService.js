import { supabase } from './supabaseClient';

export const statsService = {
    // ... possibly other stats methods ...

    /**
     * Get expense breakdown by Coop
     * Returns: [{ name: 'Pollaio A', value: 120.50 }, ...]
     */
    async getExpensesByCoop() {
        // Fetch all expense transactions with a coop_id
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                amount,
                coop_id,
                coops ( name )
            `)
            .eq('type', 'expense')
            .not('coop_id', 'is', null);

        if (error) throw error;

        // Aggregate locally
        const aggregator = {};

        data.forEach(t => {
            const name = t.coops?.name || 'Sconosciuto';
            if (!aggregator[name]) aggregator[name] = 0;
            aggregator[name] += Number(t.amount);
        });

        return Object.entries(aggregator)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    },

    /**
     * Get top products by spend
     * Returns: [{ name: 'Mais', value: 500, quantity: 20 }, ...]
     */
    async getTopProducts() {
        const { data, error } = await supabase
            .from('transaction_items')
            .select(`
                quantity,
                subtotal,
                products ( name )
            `);

        if (error) throw error;

        const aggregator = {};

        data.forEach(item => {
            const name = item.products?.name || 'Sconosciuto';
            if (!aggregator[name]) aggregator[name] = { value: 0, quantity: 0 };
            aggregator[name].value += Number(item.subtotal);
            aggregator[name].quantity += Number(item.quantity);
        });

        return Object.entries(aggregator)
            .map(([name, stats]) => ({ name, value: stats.value, quantity: stats.quantity }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Return top 5
    }
};
