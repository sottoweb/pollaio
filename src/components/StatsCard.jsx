import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, type = 'neutral', icon: Icon, onClick, children }) => {
    return (
        <div
            className={`stats-card stats-${type} ${onClick ? 'clickable' : ''}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="stats-content">
                <span className="stats-title">{title}</span>
                <span className="stats-value">
                    {type === 'income' ? '+' : type === 'expense' ? '-' : (type === 'balance' && value > 0 ? '+' : '')}
                    {['income', 'expense', 'balance'].includes(type)
                        ? `${Number(value).toFixed(2)} €`
                        : Number(value).toFixed(0)
                    }
                </span>
                {/* Render optional children (e.g. alerts) */}
                {children}
            </div>
            {Icon && (
                <div className="stats-icon-wrapper">
                    <Icon size={24} className="stats-icon" />
                    {onClick && <div className="add-indicator">+</div>}
                </div>
            )}
        </div>
    );
};

export default StatsCard;
