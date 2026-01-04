-- RESTORE USER ORGANIZATION (v4.11 - FIXED)
-- Questo script serve se l'utente è "orfano" (senza organizzazione).
-- Crea un'organizzazione di default e ci associa l'utente corrente.

DO $$
DECLARE
    -- Recupera l'ultimo ID utente che ha fatto login (o update)
    target_user_id uuid := (SELECT id FROM auth.users ORDER BY last_sign_in_at DESC LIMIT 1);
    new_org_id uuid;
BEGIN
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Nessun utente trovato. Fai login prima!';
    END IF;

    -- 1. Controlla se ha già un org
    IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = target_user_id) THEN
        RAISE NOTICE 'L''utente ha già un''organizzazione!';
    ELSE
        -- 2. Crea Organizzazione (con owner_id corretto)
        INSERT INTO public.organizations (name, owner_id, created_at)
        VALUES ('Azienda Agricola (Ripristinata)', target_user_id, now())
        RETURNING id INTO new_org_id;

        -- 3. Crea Profilo (se manca)
        INSERT INTO public.profiles (id, first_name, last_name, email)
        VALUES (target_user_id, 'Utente', 'Ripristinato', 'user@example.com')
        ON CONFLICT (id) DO NOTHING;

        -- 4. Associa Utente come Owner
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (new_org_id, target_user_id, 'owner');
        
        RAISE NOTICE 'Organizzazione ripristinata con successo! ID: %', new_org_id;
    END IF;
END $$;
