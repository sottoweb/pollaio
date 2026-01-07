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
        <div className="egg-collection-page" style={{ padding: '10px 0' }}>
            <Toaster position="top-center" />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>

                {/* DATA SELETTORE COMPATTO */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '4px'
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
                            padding: 0
                        }}
                    />
                </div>

                {/* GRIGLIA COLORI 2x2 COMPATTA */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                }}>
                    {EGG_COLORS.map((color) => (
                        <div key={color.id} style={{
                            position: 'relative',
                            height: '50px', // Altezza ridotta
                        }}>
                            {/* Uovo visuale all'interno */}
                            <div style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '22px', // Leggermente più piccolo
                                height: '28px',
                                backgroundColor: color.hex,
                                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                                border: '1px solid rgba(0,0,0,0.1)',
                                zIndex: 1,
                                boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)'
                            }}></div>

                            {/* Label piccola */}
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
                                    paddingLeft: '40px', // Meno padding
                                    paddingTop: '10px',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px', // Meno raggio
                                    background: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-primary)',
                                    fontWeight: 'bold',
                                    outline: 'none',
                                    boxShadow: 'none' // Rimuovo shadow per pulizia
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
