import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import Button from '../components/Button';
import Input from '../components/Input';
import './Forms.css';

const PREDEFINED_CATEGORIES = ['MANGIME', 'VETERINARIO', 'MANUTENZIONE', 'PULIZIA', 'ALTRO'];

const AddExpense = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categorySelect: 'MANGIME',
        customCategory: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date) return;

        const category = formData.categorySelect === 'ALTRO'
            ? (formData.customCategory || 'SPESA GENERICA')
            : formData.categorySelect;

        setLoading(true);
        try {
            await transactionService.addTransaction({
                type: 'expense',
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: category.toUpperCase()
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
                <h2>Nuova Spesa</h2>
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

                <div className="input-group">
                    <label className="input-label" htmlFor="cat-select">Causale</label>
                    <select
                        id="cat-select"
                        name="categorySelect"
                        value={formData.categorySelect}
                        onChange={handleChange}
                        className="input-field select-field"
                    >
                        {PREDEFINED_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {formData.categorySelect === 'ALTRO' && (
                    <Input
                        label="Specifica Causale"
                        type="text"
                        name="customCategory"
                        value={formData.customCategory}
                        onChange={handleChange}
                        placeholder="Es. ELETTRICITÀ"
                        required
                        className="slide-down"
                    />
                )}

                <Button
                    type="submit"
                    variant="danger"
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

export default AddExpense;
