import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import './Forms.css';

const PREDEFINED_CATEGORIES = ['MANGIME', 'VETERINARIO', 'MANUTENZIONE', 'PULIZIA', 'ALTRO'];

const AddExpense = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categorySelect: 'MANGIME',
        customCategory: ''
    });

    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            loadTransaction();
        }
    }, [id]);

    const loadTransaction = async () => {
        setLoading(true);
        try {
            const data = await transactionService.getTransactionById(id);
            if (data) {
                // Determine if category is predefined or custom
                const isPredefined = PREDEFINED_CATEGORIES.includes(data.category);

                setFormData({
                    amount: data.amount,
                    date: data.date,
                    categorySelect: isPredefined ? data.category : 'ALTRO',
                    customCategory: isPredefined ? '' : data.category
                });
            }
        } catch (error) {
            alert('Errore nel caricamento dati: ' + error.message);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

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
            const transactionData = {
                type: 'expense',
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: category.toUpperCase(),
            };

            if (isEditMode) {
                await transactionService.updateTransaction(id, transactionData);
            } else {
                await transactionService.addTransaction(transactionData);
            }
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
                <h2>{isEditMode ? 'Modifica Spesa' : 'Nuova Spesa'}</h2>
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
                    autoFocus={!isEditMode}
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
                    {isEditMode ? 'AGGIORNA' : 'INVIA'}
                </Button>
            </form>
        </div>
    );
};

export default AddExpense;
