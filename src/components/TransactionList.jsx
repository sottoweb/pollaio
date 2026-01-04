import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TransactionList.css';

const TransactionList = ({ transactions, onDelete }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [deletingId, setDeletingId] = useState(null);

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const date = transaction.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
            setDeletingId(id);
            await onDelete(id);
            setDeletingId(null);
        }
    };

    const handleEdit = (transaction) => {
        if (transaction.type === 'income') {
            navigate(`/add-income/${transaction.id}`);
        } else {
            navigate(`/add-expense/${transaction.id}`);
        }
    };

    return (
        <div className="transaction-list">
            {sortedDates.map(date => (
                <div key={date} className="date-group">
                    <h3 className="date-header">
                        {new Date(date).toLocaleDateString('it-IT', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </h3>
                    <div className="transactions-container">
                        {groupedTransactions[date].map(transaction => (
                            <div key={transaction.id} className="transaction-item slide-up">
                                <div className="transaction-icon">
                                    {transaction.type === 'income' ? (
                                        <ArrowUpCircle className="text-success" size={24} />
                                    ) : (
                                        <ArrowDownCircle className="text-danger" size={24} />
                                    )}
                                </div>
                                <div className="transaction-details">
                                    <div className="transaction-main-info">
                                        <div className="title-row">
                                            <span className="transaction-title">
                                                {transaction.type === 'income'
                                                    ? 'Vendita Uova'
                                                    : transaction.category}
                                            </span>
                                            {transaction.type === 'income' && transaction.eggs_count > 0 && (
                                                <span className="egg-badge">
                                                    🥚 {transaction.eggs_count}
                                                </span>
                                            )}
                                        </div>

                                        <span className={`transaction-amount ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                            {transaction.type === 'income' ? '+' : '-'}€{Number(transaction.amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="transaction-meta">
                                        {transaction.profiles && (
                                            <span className="transaction-author">
                                                Inserito da {transaction.profiles.first_name || 'Utente'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="transaction-actions">
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => handleEdit(transaction)}
                                        title="Modifica"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(transaction.id)}
                                        disabled={deletingId === transaction.id}
                                        title="Elimina"
                                    >
                                        <Trash2 size={16} />
                                    </button>
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
