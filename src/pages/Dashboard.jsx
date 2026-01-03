import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Filter, Calendar } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import TransactionList from '../components/TransactionList';
import StatsCard from '../components/StatsCard';
import Button from '../components/Button';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('month'); // day, week, month, year

    // Load transactions on mount
    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            const data = await transactionService.getTransactions();
            setTransactions(data || []);
        } catch (error) {
            console.error('Failed to load transactions', error);
            // In a real app, show error toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
            try {
                await transactionService.deleteTransaction(id);
                await loadTransactions(); // Reload list
            } catch (error) {
                console.error('Delete failed', error);
            }
        }
    };

    // Filter transactions based on selected time range
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return transactions.filter(t => {
            const tDate = new Date(t.date);
            // Normalize tDate to midnight for correct day comparison
            const tDay = new Date(tDate.getFullYear(), tDate.getMonth(), tDate.getDate());

            switch (timeFilter) {
                case 'day':
                    return tDay.getTime() === today.getTime();
                case 'week':
                    // Simple "current week" starting Monday
                    const day = today.getDay() || 7; // Get current day number, make Sunday (0) -> 7
                    if (day !== 1) today.setHours(-24 * (day - 1)); // Set to previous Monday
                    const startOfWeek = today;
                    return tDate >= startOfWeek;
                case 'month':
                    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
                case 'year':
                    return tDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }, [transactions, timeFilter]);

    // Calculate stats from filtered transactions
    const stats = useMemo(() => {
        return filteredTransactions.reduce((acc, t) => {
            const amount = Number(t.amount);
            if (t.type === 'income') {
                acc.income += amount;
            } else {
                acc.expense += amount;
            }
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredTransactions]);

    const balance = stats.income - stats.expense;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h2>Panoramica</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="link-stats"
                        onClick={() => navigate('/stats')}
                    >
                        Vedi Grafici Avanzati →
                    </Button>
                </div>
                <div className="filter-controls">
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="day">Oggi</option>
                        <option value="week">Questa Settimana</option>
                        <option value="month">Questo Mese</option>
                        <option value="year">Quest'Anno</option>
                    </select>
                </div>
            </div>

            <div className="stats-grid">
                <StatsCard
                    title="Entrate"
                    value={stats.income}
                    type="income"
                    icon={() => <span className="emoji-icon">💰</span>}
                />
                <StatsCard
                    title="Uscite"
                    value={stats.expense}
                    type="expense"
                    icon={() => <span className="emoji-icon">💸</span>}
                />
                <StatsCard
                    title="Bilancio"
                    value={balance}
                    type="balance"
                    icon={() => <span className="emoji-icon">⚖️</span>}
                />
            </div>

            <div className="action-buttons">
                <Button
                    variant="primary"
                    size="lg"
                    className="action-btn"
                    onClick={() => navigate('/add-income')}
                    icon={<Plus size={24} />}
                >
                    Aggiungi Entrata
                </Button>
                <Button
                    variant="danger"
                    size="lg"
                    className="action-btn"
                    onClick={() => navigate('/add-expense')}
                    icon={<Minus size={24} />}
                >
                    Aggiungi Spesa
                </Button>
            </div>

            <div className="list-section">
                <h3>Transazioni Recenti</h3>
                <TransactionList
                    transactions={filteredTransactions}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default Dashboard;
