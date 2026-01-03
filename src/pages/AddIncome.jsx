import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import Button from '../components/Button';
import Input from '../components/Input';
import './Forms.css';

const AddIncome = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        eggs_count: '',
        category: 'VENDITA UOVA'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date) return;

        setLoading(true);
        try {
            await transactionService.addTransaction({
                type: 'income',
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: formData.category,
                eggs_count: formData.eggs_count ? parseInt(formData.eggs_count) : null,
            });
            navigate('/');
        } catch (error) {
            alert('Errore durante il salvataggio: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-header">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    icon={<ArrowLeft size={20} />}
                >
                    Indietro
                </Button>
                <h2>Nuova Entrata</h2>
            </div>

            <form onSubmit={handleSubmit} className="entry-form">
                <Input
                    label="Importo (€)"
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    autoFocus
                />

                <Input
                    label="Data"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Numero Uova (Facoltativo)"
                    type="number"
                    name="eggs_count"
                    value={formData.eggs_count}
                    onChange={handleChange}
                    placeholder="0"
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    icon={<Save size={20} />}
                    className="submit-btn"
                >
                    INVIA
                </Button>
            </form>
        </div>
    );
};

export default AddIncome;
