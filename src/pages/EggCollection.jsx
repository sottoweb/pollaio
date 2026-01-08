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
    const [statsData, setStatsData] = useState({
        today: { total: 0, byColor: {} },
        week: { total: 0, byColor: {} },
        month: { total: 0, byColor: {} },
        year: { total: 0, byColor: {} }
    });
    const [coops, setCoops] = useState([]);
    const [selectedCoop, setSelectedCoop] = useState('');
    const [history, setHistory] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadCoops();
        loadHistory();
        loadStats();
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
            const data = await productionService.getRecentCollections(15);
            setHistory(data || []);
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    const loadStats = async () => {
        try {
            // Carica dati dall'inizio dell'anno per le stats
            const now = new Date();
            const startOfYear = `${now.getFullYear()}-01-01`;
            const endOfYear = `${now.getFullYear()}-12-31`;
            const data = await productionService.getProductionStats(startOfYear, endOfYear);

            calculateStats(data || []);
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    const calculateStats = (data) => {
        const now = new Date();

        // Helper per ottenere YYYY-MM-DD locale corrente
        const toYMD = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const todayStr = toYMD(now);
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Calcolo inizio settimana (Lunedi)
        const dayOfWeek = now.getDay() || 7; // 1=Lun, 7=Dom
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        const newStats = {
            today: { total: 0, byColor: {} },
            week: { total: 0, byColor: {} },
            month: { total: 0, byColor: {} },
            year: { total: 0, byColor: {} }
        };

        data.forEach(item => {
            if (!item.date) return;

            const qty = parseInt(item.quantity) || 0;
            const color = item.color;
            const rowDateStr = item.date.split('T')[0]; // YYYY-MM-DD sicura dal DB

            // Parsing manuale per evitare interpretazioni UTC del browser
            const [y, m, d] = rowDateStr.split('-').map(Number);
            const rowDateObj = new Date(y, m - 1, d); // Data locale alle 00:00

            const update = (statKey) => {
                newStats[statKey].total += qty;
                newStats[statKey].byColor[color] = (newStats[statKey].byColor[color] || 0) + qty;
            };

            // Today
            if (rowDateStr === todayStr) update('today');

            // Week (Confronto timestamp per sicurezza, rowDateObj è inizio giornata)
            if (rowDateObj >= startOfWeek) update('week');

            // Month
            if (y === currentYear && (m - 1) === currentMonth) update('month');

            // Year
            if (y === currentYear) update('year');
        });

        setStatsData(newStats);
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

    // Componente Card Riutilizzabile per il layout "Totale SX | Dettagli DX"
    const StatCard = ({ title, total, byColor, subtitle, isHistory = false }) => (
        <div style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            overflow: 'hidden',
            minHeight: '70px'
        }}>
            {/* SX: Totale */}
            <div style={{
                width: '70px',
                background: isHistory ? 'var(--color-bg-primary)' : 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid var(--border-color)',
                padding: '8px'
            }}>
                <span style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: isHistory ? 'var(--color-text-primary)' : '#F59E0B',
                    lineHeight: 1
                }}>
                    {total}
                </span>
                <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', opacity: 0.6, marginTop: '2px' }}>
                    Uova
                </span>
            </div>

            {/* DX: Dettagli */}
            <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {title}
                    </span>
                    {subtitle && <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>{subtitle}</span>}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(byColor).map(([color, qty]) => {
                        if (!qty) return null;
                        const meta = EGG_COLORS.find(c => c.id === color) || { hex: '#ccc', label: color };
                        return (
                            <div key={color} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', opacity: 0.9 }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.hex, border: '1px solid rgba(0,0,0,0.1)' }}></div>
                                <span>{qty}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="egg-collection-page" style={{ padding: '2px 0', paddingBottom: '80px' }}>
            <Toaster position="top-center" />

            <form onSubmit={async (e) => {
                await handleSubmit(e);
                loadStats(); // Ricarica anche le stats dopo il submit
            }} style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>

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

            <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* SEZIONE RIEPILOGO STATISTICHE */}
                <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontSize: '1rem', opacity: 0.8, margin: 0 }}>Statistiche</h3>
                    <StatCard title="Oggi" total={statsData.today.total} byColor={statsData.today.byColor} />
                    <StatCard title="Questa Settimana" total={statsData.week.total} byColor={statsData.week.byColor} />
                    <StatCard title="Questo Mese" total={statsData.month.total} byColor={statsData.month.byColor} />
                    <StatCard title="Quest'Anno" total={statsData.year.total} byColor={statsData.year.byColor} />
                </div>

                {/* SEZIONE STORICO */}
                <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontSize: '1rem', opacity: 0.8, margin: 0 }}>Ultime Raccolte</h3>
                    {history.map((record) => {
                        // Prepara i dati per StatCard
                        const byColor = record.items.reduce((acc, item) => {
                            acc[item.color] = item.quantity;
                            return acc;
                        }, {});

                        const timeStr = `${new Date(record.recorded_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - ${new Date(record.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                        return (
                            <StatCard
                                key={record.id}
                                title={record.coop_name}
                                subtitle={timeStr}
                                total={record.total_quantity}
                                byColor={byColor}
                                isHistory={true}
                            />
                        );
                    })}
                    {history.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>Nessuna raccolta recente</p>}
                </div>
            </div>
        </div>
    );
};

export default EggCollection;
