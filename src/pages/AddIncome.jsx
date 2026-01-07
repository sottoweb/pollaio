import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import './Forms.css';

import CRMSelector from '../components/CRMSelector';

const AddIncome = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams(); // Get ID from URL if in edit mode
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        eggs_count: '',
        category: 'VENDITA UOVA',
        customer_id: null,
        is_paid: true // Default SI
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
                setFormData({
                    amount: data.amount,
                    date: data.date,
                    eggs_count: data.eggs_count || '',
                    category: data.category,
                    customer_id: data.customer_id,
                    is_paid: data.is_paid !== false // Default true if null/undefined
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

        setLoading(true);
        try {
            const transactionData = {
                type: 'income',
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: formData.category,
                eggs_count: formData.eggs_count ? parseInt(formData.eggs_count) : null,
                customer_id: formData.customer_id,
                is_paid: formData.is_paid
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
                <h2>{isEditMode ? 'Modifica Entrata' : 'Nuova Entrata'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="entry-form">

                {/* ROW 1: Importo + Data */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1.5fr', gap: '12px' }}>
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
                        style={{ fontSize: '1.2rem', fontWeight: 'bold' }} // Make amount prominent
                        icon={<span className="text-success" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>€</span>}
                    />
                    <Input
                        label="Data"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* ROW 2: Numero Uova + Cliente */}
                <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.5fr', gap: '12px', alignItems: 'start' }}>
                    <Input
                        label="N. Uova"
                        type="number"
                        name="eggs_count"
                        value={formData.eggs_count}
                        onChange={handleChange}
                        placeholder="0"
                        icon={<span style={{ fontSize: '1.2rem' }}>🥚</span>}
                    />
                    {/* CRM Selector wrapper to fit height */}
                    <div style={{ marginTop: '0' }}>
                        <label className="input-label" style={{ marginBottom: '6px', display: 'block' }}>Cliente</label>
                        <CRMSelector
                            type="customer"
                            selectedId={formData.customer_id}
                            onSelect={(id) => setFormData(prev => ({ ...prev, customer_id: id }))}
                            minimal={true} // Hint to CRMSelector if it supports minimal mode
                        />
                    </div>
                </div>

                {/* ROW 3: Pagato Toggle */}
                <div style={{
                    background: 'var(--color-bg-secondary)',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{ fontWeight: 500 }}>Incassato?</span>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-primary)', padding: '4px', borderRadius: '8px' }}>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, is_paid: true }))}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: formData.is_paid ? 'var(--color-success)' : 'transparent',
                                color: formData.is_paid ? 'white' : 'var(--color-text-secondary)',
                                fontWeight: formData.is_paid ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            SI
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, is_paid: false }))}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: !formData.is_paid ? '#EF4444' : 'transparent', // Red for NO
                                color: !formData.is_paid ? 'white' : 'var(--color-text-secondary)',
                                fontWeight: !formData.is_paid ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            NO
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="primary"
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

export default AddIncome;
