import React, { useState, useEffect } from 'react';
import { productionService } from '../services/productionService';
import EggStatCard from './EggStatCard';

const EggProductionWidget = () => {
    const [statsData, setStatsData] = useState({
        today: { total: 0, byColor: {} },
        week: { total: 0, byColor: {} },
        month: { total: 0, byColor: {} },
        year: { total: 0, byColor: {} }
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const now = new Date();
            const startOfYear = `${now.getFullYear()}-01-01`;
            const endOfYear = `${now.getFullYear()}-12-31`;
            const data = await productionService.getProductionStats(startOfYear, endOfYear);

            calculateStats(data || []);
        } catch (error) {
            console.error("Failed to load production stats", error);
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
            const rowDateStr = item.date.split('T')[0];

            // Parsing manuale
            const [y, m, d] = rowDateStr.split('-').map(Number);
            const rowDateObj = new Date(y, m - 1, d);

            const update = (statKey) => {
                newStats[statKey].total += qty;
                newStats[statKey].byColor[color] = (newStats[statKey].byColor[color] || 0) + qty;
            };

            // Today
            if (rowDateStr === todayStr) update('today');

            // Week
            if (rowDateObj >= startOfWeek) update('week');

            // Month
            if (y === currentYear && (m - 1) === currentMonth) update('month');

            // Year
            if (y === currentYear) update('year');
        });

        setStatsData(newStats);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <EggStatCard title="Oggi" total={statsData.today.total} byColor={statsData.today.byColor} />
            <EggStatCard title="Questa Settimana" total={statsData.week.total} byColor={statsData.week.byColor} />
            <EggStatCard title="Questo Mese" total={statsData.month.total} byColor={statsData.month.byColor} />
            <EggStatCard title="Quest'Anno" total={statsData.year.total} byColor={statsData.year.byColor} />
        </div>
    );
};

export default EggProductionWidget;
