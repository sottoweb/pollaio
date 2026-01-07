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

                {/* GRIGLIA COLORI 2x2 COMPATTA */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                }}>
                    {EGG_COLORS.map((color) => (
                        <div key={color.id} style={{
                            position: 'relative',
                            height: '60px', // Altezza fissa contenuta
                        }}>
                            {/* Uovo visuale all'interno (Background style) */}
                            <div style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '24px',
                                height: '32px',
                                backgroundColor: color.hex,
                                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', // Forma uovo
                                border: '1px solid rgba(0,0,0,0.1)',
                                zIndex: 1,
                                boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)' // Effetto volume leggero
                            }}></div>

                            {/* Label piccola dentro l'input in alto a destra */}
                            <span style={{
                                position: 'absolute',
                                right: '12px',
                                top: '4px',
                                fontSize: '0.7rem',
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
                                    fontSize: '1.5rem',
                                    textAlign: 'right', // Numeri a destra per non coprire l'uovo
                                    paddingRight: '12px',
                                    paddingLeft: '50px', // Spazio per l'uovo
                                    paddingTop: '12px', // Spazio per la label
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    background: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-primary)',
                                    fontWeight: 'bold',
                                    outline: 'none',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
