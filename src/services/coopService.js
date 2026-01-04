import { supabase } from './supabaseClient';

export const coopService = {

    // --- COOPS ---

    async getCoops() {
        const { data, error } = await supabase
            .from('coops')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addCoop(coop) {
        const { data, error } = await supabase
            .from('coops')
            .insert([coop])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteCoop(id) {
        const { error } = await supabase
            .from('coops')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- BREEDS (RAZZE) ---

    async getBreedsByCoop(coopId) {
        const { data, error } = await supabase
            .from('coop_breeds')
            .select('*')
            .eq('coop_id', coopId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getBreedById(id) {
        const { data, error } = await supabase
            .from('coop_breeds')
            .select('*, coops(name)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async addBreed(breed) {
        const { data, error } = await supabase
            .from('coop_breeds')
            .insert([breed])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateBreedCount(id, count) {
        const { data, error } = await supabase
            .from('coop_breeds')
            .update({ total_count: count })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateBreed(id, updates) {
        const { data, error } = await supabase
            .from('coop_breeds')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // --- HENS (GALLINE SINGOLE) ---

    async getHensByBreed(breedId) {
        const { data, error } = await supabase
            .from('hens')
            .select('*')
            .eq('coop_breed_id', breedId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async addHen(hen) {
        // Validation: Check constraint logic can be here or in UI. 
        // We'll enforce it in UI for better UX, but simple DB add here.
        const { data, error } = await supabase
            .from('hens')
            .insert([hen])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteHen(id) {
        const { error } = await supabase
            .from('hens')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- STORAGE (IMAGES) ---

    async uploadBreedImage(file) {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('breed-images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('breed-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    async deleteBreedImage(url) {
        if (!url) return;

        // Extract filename from URL
        const path = url.split('/').pop();

        const { error } = await supabase.storage
            .from('breed-images')
            .remove([path]);

        if (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }
};
