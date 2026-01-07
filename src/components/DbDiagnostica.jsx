import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const DbDiagnostica = () => {
    const [status, setStatus] = useState({
        auth: 'Checking...',
        products: 'Checking...',
        storage: 'Checking...',
        schema: 'Checking...'
    });
    const [logs, setLogs] = useState([]);

    const log = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    const runCheck = async () => {
        setLogs([]);
        log("Inizio diagnostica...");

        // 1. AUTH
        const { data: { session } } = await supabase.auth.getSession();
        const authStatus = session ? `Loggato come ${session.user.email}` : "NON LOGGATO";
        setStatus(prev => ({ ...prev, auth: authStatus }));
        log(authStatus);

        if (!session) {
            log("STOP: Devi essere loggato per testare il DB.");
            return;
        }

        // 2. PRODUCTS TABLE
        try {
            const { data, error } = await supabase.from('products').select('*').limit(1);
            if (error) {
                setStatus(prev => ({ ...prev, products: "ERRORE: " + error.message }));
                log("Errore Prodotti: " + JSON.stringify(error));
            } else {
                setStatus(prev => ({ ...prev, products: "OK (Accessibile)" }));
                log("Lettura Prodotti OK.");

                // CHECK COLUMNS (Insert dummy)
                const dummy = {
                    name: '__TEST__TEMP__',
                    default_price: 1,
                    description: 'test desc',
                    image_url: 'test_url'
                };

                const { data: insData, error: insError } = await supabase.from('products').insert([dummy]).select();
                if (insError) {
                    log("ERRORE INSERT PRODOTTO: " + insError.message);
                    setStatus(prev => ({ ...prev, schema: "ERRORE COLONNE O PERMESSI" }));
                } else {
                    log("Insert Prodotto OK. Colonne esistono.");
                    setStatus(prev => ({ ...prev, schema: "OK (Colonne presenti)" }));
                    // Clean up
                    await supabase.from('products').delete().eq('id', insData[0].id);
                    log("Delete Prodotto Test OK.");
                }
            }
        } catch (e) {
            log("Eccezione Prodotti: " + e.message);
        }

        // 3. STORAGE
        try {
            const fileName = `test_${Date.now()}.txt`;
            const file = new Blob(['test content'], { type: 'text/plain' });

            const { error: upError } = await supabase.storage.from('product-images').upload(fileName, file);
            if (upError) {
                log("ERRORE UPLOAD: " + upError.message);
                setStatus(prev => ({ ...prev, storage: "ERRORE: " + upError.message }));
            } else {
                log("Upload File OK.");
                setStatus(prev => ({ ...prev, storage: "OK (Scrivibile)" }));
                // Cleanup
                // await supabase.storage.from('product-images').remove([fileName]);
            }
        } catch (e) {
            setStatus(prev => ({ ...prev, storage: "ERRORE CRITICO: " + e.message }));
        }
    };

    useEffect(() => {
        runCheck();
    }, []);

    return (
        <div style={{ padding: 20, background: '#111', color: '#0f0', fontFamily: 'monospace', margin: 20, borderRadius: 10 }}>
            <h3>DIAGNOSTICA DB</h3>
            <button onClick={runCheck} style={{ padding: '8px 16px', background: '#333', color: 'white', border: '1px solid #555', cursor: 'pointer', marginBottom: 10 }}>RIAVVIA TEST</button>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 10 }}>
                <b>AUTH:</b> <span>{status.auth}</span>
                <b>PRODUCTS:</b> <span>{status.products}</span>
                <b>SCHEMA:</b> <span>{status.schema}</span>
                <b>STORAGE:</b> <span>{status.storage}</span>
            </div>
            <hr style={{ borderColor: '#333' }} />
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    );
};

export default DbDiagnostica;
