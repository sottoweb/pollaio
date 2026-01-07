import { supabase } from './supabaseClient';

export const productionService = {
    // Aggiungi una registrazione di raccolta
    async addCollection(collectionData) {
        // collectionData: { date, items: [{ color, quantity }] }
        // Trasformiamo l'input in righe singole per il DB
        const rows = collectionData.items
            .filter(item => item.quantity > 0) // Salva solo se c'è quantità
            .map(item => ({
                date: collectionData.date,
                color: item.color,
                quantity: parseInt(item.quantity)
            }));

        if (rows.length === 0) return null;

        const { data, error } = await supabase
            .from('egg_production')
            .insert(rows)
            .select();

        if (error) throw error;
        return data;
    },

    // Ottieni la produzione di un giorno specifico
    async getDailyProduction(date) {
        const { data, error } = await supabase
            .from('egg_production')
            .select('*')
            .eq('date', date);

        if (error) throw error;
        return data;
    },

    // Ottieni la produzione di un intervallo (per statistiche mese/anno)
    async getProductionStats(startDate, endDate) {
        const { data, error } = await supabase
            .from('egg_production')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data;
    }
};
