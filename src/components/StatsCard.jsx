import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, type = 'neutral', icon: Icon }) => {
    return (
        <div className={`stats-card stats-${type}`}>
            <div className="stats-content">
                <span className="stats-title">{title}</span>
                <span className="stats-value">
                    {type === 'income' ? '+' : type === 'expense' ? '-' : (value > 0 ? '+' : '')}
                    {Number(value).toFixed(2)} €
                </span>
            </div>
            {Icon && (
                <div className="stats-icon-wrapper">
                    <Icon size={24} className="stats-icon" />
                </div>
            )}
        </div>
    );
};

export default StatsCard;
