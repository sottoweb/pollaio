import { supabase } from './supabaseClient';

export const productionService = {
    // Aggiungi una registrazione di raccolta
    async addCollection(collectionData) {
        // collectionData: { date, items: [{ color, quantity }], coopId }

        const sessionId = crypto.randomUUID(); // ID univoco per il raggruppamento
        const now = new Date().toISOString(); // Timestamp preciso

        const rows = collectionData.items
            .filter(item => item.quantity > 0)
            .map(item => ({
                date: collectionData.date,
                color: item.color,
                quantity: parseInt(item.quantity),
                coop_id: collectionData.coopId || null,
                session_id: sessionId,
                recorded_at: now
            }));

        if (rows.length === 0) return null;

        const { data, error } = await supabase
            .from('egg_production')
            .insert(rows)
            .select();

        if (error) throw error;
        return data;
    },

    // Ottieni le ultime raccolte raggruppate per sessione
    async getRecentCollections(limit = 10) {
        const { data, error } = await supabase
            .from('egg_production')
            .select(`
                *,
                coops ( name )
            `)
            .order('recorded_at', { ascending: false })
            // Prendo abbastanza righe raw per formare 'limit' sessioni (assumendo ~4 righe a sessione)
            // Meglio prenderne un po' e raggruppare, non sarà perfetto il limit preciso ma va bene.
            .limit(limit * 5);

        if (error) {
            // Se la colonna coop_id non esiste ancora (script non lanciato), fallirà.
            // Gestiamo il caso o lasciamo che il chiamante gestisca.
            console.error("Error fetching collections:", error);
            return [];
        }

        // Raggruppa lato client
        const groups = {};

        data.forEach(row => {
            // Usa session_id per raggruppare. Se manca (vecchi dati), raggruppa brutalmente per timestamp o data.
            // Attenzione: recorded_at potrebbe essere null nei vecchi dati.
            const uniqueKey = row.session_id || `${row.date}_${row.coop_id || 'unknown'}_${new Date(row.created_at).getHours()}`;

            if (!groups[uniqueKey]) {
                groups[uniqueKey] = {
                    id: uniqueKey,
                    date: row.date,
                    recorded_at: row.recorded_at || row.created_at,
                    coop_name: row.coops?.name || 'Pollaio',
                    total_quantity: 0,
                    items: []
                };
            }
            groups[uniqueKey].items.push({
                color: row.color,
                quantity: row.quantity
            });
            groups[uniqueKey].total_quantity += row.quantity;
        });

        // Ritorna array ordinato decrescente
        return Object.values(groups).sort((a, b) =>
            new Date(b.recorded_at) - new Date(a.recorded_at)
        );
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
    },

    // Recupera dettagli di una sessione specifica per l'edit
    async getCollectionBySessionId(sessionId) {
        const { data, error } = await supabase
            .from('egg_production')
            .select(`*, coops(name)`)
            .eq('session_id', sessionId);

        if (error) throw error;
        return data;
    },

    // Elimina intera sessione
    async deleteCollection(sessionId) {
        const { error } = await supabase
            .from('egg_production')
            .delete()
            .eq('session_id', sessionId);

        if (error) throw error;
    },

    // Aggiorna sessione
    async updateCollection(sessionId, collectionData) {
        // collectionData: { date, items, coopId, originalRecordedAt }

        // 1. Delete old rows
        const { error: delError } = await supabase
            .from('egg_production')
            .delete()
            .eq('session_id', sessionId);

        if (delError) throw delError;

        // 2. Insert new rows with SAME session_id
        const rows = collectionData.items
            .filter(item => item.quantity > 0)
            .map(item => ({
                date: collectionData.date,
                color: item.color,
                quantity: parseInt(item.quantity),
                coop_id: collectionData.coopId || null,
                session_id: sessionId, // PRESERVE ID
                recorded_at: collectionData.originalRecordedAt || new Date().toISOString()
            }));

        if (rows.length > 0) {
            const { error: insError } = await supabase
                .from('egg_production')
                .insert(rows);

            if (insError) throw insError;
        }
    }
};
