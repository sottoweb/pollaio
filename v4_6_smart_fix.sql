-- SMART FIX (v4.6)
-- Assegna i dati all'organizzazione dell'ULTIMO utente registrato (Tu).

DO $$
DECLARE
    last_user_id uuid;
    target_org_id uuid;
BEGIN
    -- 1. Trova l'ultimo profilo creato (presumibilmente il tuo account attuale)
    SELECT id INTO last_user_id 
    FROM public.profiles 
    ORDER BY updated_at DESC 
    LIMIT 1;
    
    -- 2. Trova l'organizzazione di questo utente
    SELECT organization_id INTO target_org_id 
    FROM public.organization_members 
    WHERE user_id = last_user_id 
    LIMIT 1;

    IF target_org_id IS NOT NULL THEN
        RAISE NOTICE 'Utente Trovato: %', last_user_id;
        RAISE NOTICE 'Organizzazione Target: %', target_org_id;

        -- 3. Assegna TUTTI i dati a questa organizzazione
        UPDATE public.transactions SET organization_id = target_org_id;
        UPDATE public.coops SET organization_id = target_org_id;
        
        -- 4. Assegna anche la proprietà (created_by) a questo utente per sicurezza
        UPDATE public.transactions SET created_by = last_user_id;
        UPDATE public.coops SET created_by = last_user_id;
        UPDATE public.hens SET created_by = last_user_id;

    ELSE
        RAISE EXCEPTION 'Impossibile trovare un''organizzazione per l''ultimo utente.';
    END IF;
END $$;
