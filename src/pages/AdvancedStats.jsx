import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { transactionService } from '../services/transactionService';
import Button from '../components/Button';
import Input from '../components/Input';
import './AdvancedStats.css';

const COLORS = ['#10b981', '#ef4444', '#fbbf24', '#3b82f6', '#8b5cf6', '#ec4899'];

const AdvancedStats = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st
        end: new Date().toISOString().split('T')[0] // Today
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await transactionService.getTransactions();
            setTransactions(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        return transactions.filter(t => {
            return t.date >= dateRange.start && t.date <= dateRange.end;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [transactions, dateRange]);

    // Data for Trend Chart
    const trendData = useMemo(() => {
        const grouped = {};
        filteredData.forEach(t => {
            const date = t.date; // Or simplify to month if range is large
            if (!grouped[date]) grouped[date] = { date, income: 0, expense: 0 };
            if (t.type === 'income') grouped[date].income += Number(t.amount);
            else grouped[date].expense += Number(t.amount);
        });
        return Object.values(grouped);
    }, [filteredData]);

    // Data for Expense Pie Chart
    const expenseData = useMemo(() => {
        const grouped = {};
        filteredData.filter(t => t.type === 'expense').forEach(t => {
            const cat = t.category;
            if (!grouped[cat]) grouped[cat] = 0;
            grouped[cat] += Number(t.amount);
        });
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredData]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, t) => {
            if (t.type === 'income') acc.income += Number(t.amount);
            else acc.expense += Number(t.amount);
            return acc;
        }, { income: 0, expense: 0 });
    }, [filteredData]);

    return (
        <div className="stats-page">
            <div className="stats-header">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    icon={<ArrowLeft size={20} />}
                >
                    Dashboard
                </Button>
                <h2>Statistiche Avanzate</h2>
            </div>

            <div className="filters-section">
                <div className="date-inputs">
                    <Input
                        label="Dal"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <Input
                        label="Al"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                </div>
                <div className="period-summary">
                    <div className="summary-pill income">Entrate: {totals.income.toFixed(2)}€</div>
                    <div className="summary-pill expense">Uscite: {totals.expense.toFixed(2)}€</div>
                    <div className="summary-pill balance">Bilancio: {(totals.income - totals.expense).toFixed(2)}€</div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card wide">
                    <h3>Andamento Finanziario</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="income" name="Entrate" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="expense" name="Uscite" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>Ripartizione Spese</h3>
                    <div className="chart-container">
                        {expenseData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `${Number(value).toFixed(2)} €`}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data">Nessuna spesa nel periodo</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedStats;
