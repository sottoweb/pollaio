import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productionService } from '../services/productionService';
import { Save, Calendar, ArrowLeft } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const EGG_COLORS = [
    { id: 'ROSA', label: 'Classiche (Rosa)', hex: '#E6C6A0', icon: '🥚' },
    { id: 'BIANCO', label: 'Bianche', hex: '#F9FAFB', icon: '⚪' },
    { id: 'VERDE', label: 'Verdi / Blu', hex: '#D1FAE5', icon: '🟢' },
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
    const [isSaving, setIsSaving] = useState(false);

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

        setIsSaving(true);
        try {
            const items = Object.entries(counts).map(([color, quantity]) => ({
                color,
                quantity: parseInt(quantity) || 0
            }));

            await productionService.addCollection({ date, items });

            toast.success("Raccolta salvata! 🐔");
            // Reset o Redirect? Meglio restare qui o andare alla dashboard.
            // Per ora reset parziale
            setCounts({
                'ROSA': '',
                'BIANCO': '',
                'VERDE': '',
                'CIOCCOLATO': ''
            });
            setTimeout(() => navigate('/'), 1500);

        } catch (error) {
            console.error(error);
            toast.error("Errore nel salvataggio");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="egg-collection-page">
            <Toaster position="top-center" />
            <div className="page-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                    <ArrowLeft size={24} color="var(--color-text-primary)" />
                </button>
                <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Registra Raccolta 🧺
                </h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>

                {/* DATA SELETTORE COMPATTO */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '10px'
                }}>
                    <Calendar size={18} className="text-secondary" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '1rem',
                            color: 'var(--color-text-primary)',
                            fontWeight: '600',
                            textAlign: 'center'
                        }}
                    />
                </div>

                {/* GRIGLIA COLORI 2x2 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                }}>
                    {EGG_COLORS.map((color) => (
                        <div key={color.id} style={{
                            background: 'var(--color-bg-secondary)',
                            borderRadius: '16px',
                            padding: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: color.hex,
                                border: '2px solid rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {color.icon}
                            </div>

                            <span style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                {color.label.split(' ')[0]} {/* Mostra solo prima parola per spazio */}
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
                                    height: '45px',
                                    fontSize: '1.5rem',
                                    textAlign: 'center',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: '12px',
                                    background: 'var(--color-bg-primary)',
                                    color: 'var(--color-text-primary)',
                                    fontWeight: 'bold',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.select()} // Seleziona tutto al focus per edit rapido
                            />
                        </div>
                    ))}
                </div>

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={isSaving}
                    style={{
                        marginTop: '10px',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Orange/Gold for eggs
                        color: 'white',
                        border: 'none',
                        padding: '18px',
                        borderRadius: '16px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: isSaving ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        transition: 'transform 0.1s'
                    }}
                >
                    <Save size={24} />
                    {isSaving ? 'Salvataggio...' : 'SALVA RACCOLTA'}
                </button>

            </form>
        </div>
    );
};

export default EggCollection;
