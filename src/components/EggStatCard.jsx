import React from 'react';

const EGG_COLORS = [
    { id: 'VERDE', label: 'Verdi / Blu', hex: '#D1FAE5', icon: '🟢' },
    { id: 'ROSA', label: 'Classiche (Rosa)', hex: '#E6C6A0', icon: '🥚' },
    { id: 'BIANCO', label: 'Bianche', hex: '#F9FAFB', icon: '⚪' },
    { id: 'CIOCCOLATO', label: 'Cioccolato', hex: '#78350F', icon: '🟤' }
];

const EggStatCard = ({ title, total, byColor, subtitle, isHistory = false }) => (
    <div style={{
        background: 'var(--color-bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        overflow: 'hidden',
        minHeight: '70px',
        marginBottom: '10px' // Added generic margin bottom for spacing in lists
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

export default EggStatCard;
