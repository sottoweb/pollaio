-- FIX SCRIPT: Assegna session_id ai vecchi record per renderli modificabili/eliminabili
-- Raggruppa i record creati nello stesso momento (stessa 'raccolta') sotto lo stesso ID.

DO $$
DECLARE
    r RECORD;
    new_uuid UUID;
BEGIN
    -- Itera su ogni gruppo di record (data + ora precisa + pollaio) che non ha session_id
    FOR r IN 
        SELECT date, created_at, coop_id
        FROM egg_production 
        WHERE session_id IS NULL
        GROUP BY date, created_at, coop_id
    LOOP
        -- Genera un nuovo UUID per questo gruppo
        new_uuid := gen_random_uuid();
        
        -- Aggiorna tutte le righe del gruppo
        UPDATE egg_production
        SET session_id = new_uuid
        WHERE session_id IS NULL
          AND date = r.date
          AND created_at = r.created_at
          AND (coop_id IS NULL OR coop_id = r.coop_id)
          AND (r.coop_id IS NULL OR coop_id = r.coop_id);
    END LOOP;
END $$;
