import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productionService } from '../services/productionService';
import { coopService } from '../services/coopService';
import { Save, Calendar, Trash2, ArrowLeft, MapPin } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const EGG_COLORS = [
    { id: 'VERDE', label: 'Verdi / Blu', hex: '#D1FAE5', icon: '🟢' },
    { id: 'ROSA', label: 'Classiche (Rosa)', hex: '#E6C6A0', icon: '🥚' },
    { id: 'BIANCO', label: 'Bianche', hex: '#F9FAFB', icon: '⚪' },
    { id: 'CIOCCOLATO', label: 'Cioccolato', hex: '#78350F', icon: '🟤' }
];

const EditCollection = () => {
    const navigate = useNavigate();
    const { sessionId } = useParams();

    const [date, setDate] = useState('');
    const [counts, setCounts] = useState({
        'ROSA': '',
        'BIANCO': '',
        'VERDE': '',
        'CIOCCOLATO': ''
    });
    const [coops, setCoops] = useState([]);
    const [selectedCoop, setSelectedCoop] = useState('');
    const [originalRecordedAt, setOriginalRecordedAt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const coopsData = await coopService.getCoops();
                setCoops(coopsData || []);

                if (sessionId) {
                    const rows = await productionService.getCollectionBySessionId(sessionId);
                    if (rows && rows.length > 0) {
                        setDate(rows[0].date);
                        setSelectedCoop(rows[0].coop_id || '');
                        setOriginalRecordedAt(rows[0].recorded_at);

                        const newCounts = {
                            'ROSA': '',
                            'BIANCO': '',
                            'VERDE': '',
                            'CIOCCOLATO': ''
                        };
                        rows.forEach(r => {
                            if (newCounts.hasOwnProperty(r.color)) {
                                newCounts[r.color] = r.quantity;
                            }
                        });
                        setCounts(newCounts);
                    } else {
                        toast.error("Raccolta non trovata");
                        navigate('/production');
                    }
                }
            } catch (error) {
                console.error("Error loading data", error);
                toast.error("Errore caricamento dati");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [sessionId, navigate]);

    const handleInputChange = (colorId, value) => {
        setCounts(prev => ({
            ...prev,
            [colorId]: value === '' ? '' : parseInt(value) || 0
        }));
    };

    const handleIncrement = (colorId) => {
        // UX Magic: Haptic Feedback
        if (navigator.vibrate) navigator.vibrate(40);

        setCounts(prev => {
            const currentVal = prev[colorId] === '' ? 0 : parseInt(prev[colorId]);
            return {
                ...prev,
                [colorId]: currentVal + 1
            };
        });
    };

    const handleDelete = async () => {
        if (!window.confirm("Sei sicuro di voler eliminare questa raccolta?")) return;

        setIsDeleting(true);
        try {
            await productionService.deleteCollection(sessionId);
            toast.success("Raccolta eliminata");
            setTimeout(() => navigate('/production'), 1000);
        } catch (error) {
            console.error(error);
            toast.error("Errore durante l'eliminazione");
            setIsDeleting(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

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

            await productionService.updateCollection(sessionId, {
                date,
                items,
                coopId: selectedCoop,
                originalRecordedAt
            });

            toast.success("Modifiche salvate! 💾");
            setTimeout(() => navigate('/production'), 1000);

        } catch (error) {
            console.error(error);
            toast.error("Errore nel salvataggio");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div style={{ padding: '20px', textAlign: 'center', color: 'white' }}>Caricamento...</div>;

    return (
        <div className="edit-collection-page" style={{ padding: '10px 0', minHeight: '100vh', paddingBottom: '40px' }}>
            <Toaster position="top-center" />

            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>

                {/* Header Nav */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                    <button
                        onClick={() => navigate('/production')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-text-primary)',
                            padding: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Modifica Raccolta</h2>
                    <div style={{ flex: 1 }}></div>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                    {/* Selectors Row */}
                    <div style={{ display: 'flex', gap: '8px' }}>
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
                            </select>
                        </div>

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

                    {/* Egg Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginTop: '10px'
                    }}>
                        {EGG_COLORS.map((color) => (
                            <div key={color.id} style={{
                                position: 'relative',
                                height: '60px', // INCREASED HEIGHT
                            }}>
                                {/* UX Magic Button */}
                                <button
                                    type="button"
                                    onClick={() => handleIncrement(color.id)}
                                    style={{
                                        position: 'absolute',
                                        left: '12px', // ADJUSTED
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        zIndex: 10,
                                        outline: 'none',
                                        transition: 'transform 0.1s'
                                    }}
                                >
                                    <div style={{
                                        width: '30px', // INCREASED
                                        height: '38px', // INCREASED
                                        backgroundColor: color.hex,
                                        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), 0 2px 5px rgba(0,0,0,0.15)',
                                        transition: 'transform 0.1s'
                                    }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                                        onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    ></div>
                                </button>

                                <span style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '4px',
                                    fontSize: '0.75rem',
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
                                        fontSize: '1.8rem', // INCREASED
                                        textAlign: 'right',
                                        paddingRight: '12px',
                                        paddingLeft: '55px', // INCREASED
                                        paddingTop: '12px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '16px',
                                        background: 'var(--color-bg-secondary)',
                                        color: 'var(--color-text-primary)',
                                        fontWeight: 'bold',
                                        outline: 'none',
                                        boxShadow: 'none'
                                    }}
                                    onFocus={(e) => e.target.select()}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                            marginTop: '20px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '16px',
                            borderRadius: '16px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: isSaving ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                            transition: 'transform 0.1s'
                        }}
                    >
                        <Save size={20} />
                        {isSaving ? 'Salvataggio...' : 'SALVA MODIFICHE'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditCollection;
