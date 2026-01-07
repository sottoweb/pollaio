import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productionService } from '../services/productionService';
import { coopService } from '../services/coopService'; // Assicurati che esista
import { Save, Calendar, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const EGG_COLORS = [
    { id: 'VERDE', label: 'Verdi / Blu', hex: '#D1FAE5', icon: '🟢' },
    { id: 'ROSA', label: 'Classiche (Rosa)', hex: '#E6C6A0', icon: '🥚' },
    { id: 'BIANCO', label: 'Bianche', hex: '#F9FAFB', icon: '⚪' },
    { id: 'CIOCCOLATO', label: 'Cioccolato', hex: '#78350F', icon: '🟤' }
];

const EggCollection = () => {
    const navigate = useNavigate();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [counts, setCounts] = useState({
        'ROSA': '',
        'BIANCO': '',
        'VERDE': '',
        'CIOCCOLATO': ''
    });
    const [coops, setCoops] = useState([]);
    const [selectedCoop, setSelectedCoop] = useState('');
    const [history, setHistory] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadCoops();
        loadHistory();
    }, []);

    const loadCoops = async () => {
        try {
            const data = await coopService.getCoops();
            setCoops(data || []);
            if (data && data.length > 0) {
                setSelectedCoop(data[0].id);
            }
        } catch (error) {
            console.error("Failed to load coops", error);
        }
    };

    const loadHistory = async () => {
        try {
            const data = await productionService.getRecentCollections();
            setHistory(data || []);
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    const handleInputChange = (colorId, value) => {
        setCounts(prev => ({
            ...prev,
            [colorId]: value === '' ? '' : parseInt(value) || 0
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verifica se c'è almeno un dato
        const hasData = Object.values(counts).some(val => val > 0);
        if (!hasData) {
            toast.error("Inserisci almeno un uovo!");
            return;
        }

        if (!selectedCoop) {
            toast.error("Seleziona un pollaio!");
            return;
        }

        setIsSaving(true);
        try {
            const items = Object.entries(counts).map(([color, quantity]) => ({
                color,
                quantity: parseInt(quantity) || 0
            }));

            await productionService.addCollection({
                date,
                items,
                coopId: selectedCoop
            });

            toast.success("Raccolta salvata! 🐔");

            // Reset counts only
            setCounts({
                'ROSA': '',
                'BIANCO': '',
                'VERDE': '',
                'CIOCCOLATO': ''
            });

            // Reload history to show new entry
            await loadHistory();

        } catch (error) {
            console.error(error);
            toast.error("Errore nel salvataggio");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="egg-collection-page" style={{ padding: '2px 0', paddingBottom: '80px' }}>
            <Toaster position="top-center" />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>

                {/* HEADERS ROW: POLLAIO + DATA */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* SELETTORE POLLAIO */}
                    <div style={{
                        flex: 1,
                        background: 'var(--color-bg-secondary)',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <MapPin size={16} className="text-secondary" />
                        <select
                            value={selectedCoop}
                            onChange={(e) => setSelectedCoop(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-primary)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                width: '100%',
                                outline: 'none'
                            }}
                        >
                            {coops.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                            {coops.length === 0 && <option>Caricamento...</option>}
                        </select>
                    </div>

                    {/* DATA SELETTORE */}
                    <div style={{
                        flex: 1,
                        background: 'var(--color-bg-secondary)',
                        padding: '8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <Calendar size={16} className="text-secondary" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-primary)',
                                fontWeight: '600',
                                textAlign: 'center',
                                padding: 0,
                                width: '100%'
                            }}
                        />
                    </div>
                </div>

                {/* GRIGLIA COLORI 2x2 COMPATTA (Codice invariato, solo referenziato) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                }}>
                    {EGG_COLORS.map((color) => (
                        <div key={color.id} style={{
                            position: 'relative',
                            height: '50px',
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '22px',
                                height: '28px',
                                backgroundColor: color.hex,
                                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                                border: '1px solid rgba(0,0,0,0.1)',
                                zIndex: 1,
                                boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)'
                            }}></div>

                            <span style={{
                                position: 'absolute',
                                right: '10px',
                                top: '3px',
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                color: 'var(--color-text-secondary)',
                                zIndex: 1,
                                pointerEvents: 'none'
                            }}>
                                {color.label.split(' ')[0]}
                            </span>

                            <input
                                type="number"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="0"
                                value={counts[color.id]}
                                onChange={(e) => handleInputChange(color.id, e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    fontSize: '1.4rem',
                                    textAlign: 'right',
                                    paddingRight: '12px',
                                    paddingLeft: '40px',
                                    paddingTop: '10px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    background: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-primary)', // Assicura contrasto
                                    fontWeight: 'bold',
                                    outline: 'none',
                                    boxShadow: 'none'
                                }}
                                onFocus={(e) => e.target.select()}
                            />
                        </div>
                    ))}
                </div>

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                        marginTop: '4px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: isSaving ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                        transition: 'transform 0.1s'
                    }}
                >
                    <Save size={20} />
                    {isSaving ? 'Salvataggio...' : 'SALVA RACCOLTA'}
                </button>
            </form>

            {/* STORICO RECENTE */}
            <div style={{ marginTop: '24px', padding: '0 8px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px', opacity: 0.8 }}>Ultime Raccolte</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {history.map((record) => (
                        <div key={record.id} style={{
                            background: 'var(--color-bg-secondary)',
                            borderRadius: '12px',
                            padding: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                    <MapPin size={14} className="text-secondary" />
                                    <span>{record.coop_name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', opacity: 0.7 }}>
                                    <Clock size={14} />
                                    {/* Mostra Data e Ora */}
                                    <span>
                                        {new Date(record.recorded_at).toLocaleDateString()} {' '}
                                        {new Date(record.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {record.items.map((item, idx) => {
                                    // Trova il colore per l'hex
                                    const meta = EGG_COLORS.find(c => c.id === item.color) || { hex: '#ccc', label: item.color };
                                    return (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: 'var(--color-bg-primary)',
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <div style={{ width: '10px', height: '14px', background: meta.hex, borderRadius: '50%' }}></div>
                                            <strong>{item.quantity}</strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '0.9rem' }}>
                            Nessuna raccolta recente
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EggCollection;
