import { supabase } from './supabaseClient';

export const crmService = {
    // --- CUSTOMERS ---

    async getCustomers() {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addCustomer(name, notes = '') {
        const { data, error } = await supabase
            .from('customers')
            .insert([{ name, notes }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- SUPPLIERS ---

    async getSuppliers() {
        const { data, error } = await supabase
            .from('suppliers')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addSupplier(name, category = '') {
        const { data, error } = await supabase
            .from('suppliers')
            .insert([{ name, category }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
