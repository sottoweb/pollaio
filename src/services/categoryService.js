import { supabase } from './supabaseClient';

export const categoryService = {
    async getCategories() {
        const { data, error } = await supabase
            .from('expense_categories')
            .select('*')
            // Order by priority (highest first), then by name
            .order('priority', { ascending: false })
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addCategory(name) {
        // Default priority 50 for custom categories (middle ground)
        const { data, error } = await supabase
            .from('expense_categories')
            .insert([{ name: name.toUpperCase(), priority: 50 }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
