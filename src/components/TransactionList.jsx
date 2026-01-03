import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Egg, Trash2, Pencil } from 'lucide-react';
import './TransactionList.css';
import Button from './Button';

const TransactionList = ({ transactions, onDelete, isLoading }) => {
    const navigate = useNavigate();
    // Group transactions by date
    const groupedTransactions = useMemo(() => {
        const groups = {};
        transactions.forEach(t => {
            const dateStr = new Date(t.date).toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(t);
        });
        return groups;
    }, [transactions]);

    if (isLoading) {
        return <div className="loading-state">Caricamento transazioni...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div className="empty-state">
                <Egg size={48} className="empty-icon" />
                <p>Nessuna transazione presente.</p>
                <p className="sub-text">Inizia aggiungendo un'entrata o una spesa.</p>
            </div>
        );
    }

    return (
        <div className="transaction-list">
            {Object.entries(groupedTransactions).map(([date, items]) => (
                <div key={date} className="date-group">
                    <h3 className="date-header">{date}</h3>
                    <div className="transaction-items">
                        {items.map(t => (
                            <div key={t.id} className="transaction-item">
                                <div className="t-icon-wrapper">
                                    {t.type === 'income' ? (
                                        <TrendingUp className="icon-income" />
                                    ) : (
                                        <TrendingDown className="icon-expense" />
                                    )}
                                </div>

                                <div className="t-details">
                                    <span className="t-category">{t.category}</span>
                                    {t.eggs_count && (
                                        <span className="t-meta">{t.eggs_count} Uova</span>
                                    )}
                                </div>

                                <div className="t-amount-wrapper">
                                    <span className={`t-amount ${t.type}`}>
                                        {t.type === 'income' ? '+' : '-'} {Number(t.amount).toFixed(2)} €
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="btn-icon-only"
                                        onClick={() => navigate(t.type === 'income' ? `/edit-income/${t.id}` : `/edit-expense/${t.id}`)}
                                        aria-label="Modifica transazione"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="btn-delete"
                                        onClick={() => onDelete(t.id)}
                                        aria-label="Elimina transazione"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransactionList;
