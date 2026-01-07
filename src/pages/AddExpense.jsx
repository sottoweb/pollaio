import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Box } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { inventoryService } from '../services/inventoryService';
import { coopService } from '../services/coopService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import CRMSelector from '../components/CRMSelector';
import ProductSelector from '../components/ProductSelector';
import './Forms.css';

const PREDEFINED_CATEGORIES = ['MANGIME', 'VETERINARIO', 'MANUTENZIONE', 'PULIZIA', 'ALTRO'];

const AddExpense = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Core Data
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categorySelect: 'MANGIME',
        customCategory: '',
        supplier_id: null
    });

    // Inventory Data
    const [showInventory, setShowInventory] = useState(false);
    const [coops, setCoops] = useState([]);
    const [items, setItems] = useState([]);

    const isEditMode = !!id;

    useEffect(() => {
        loadCoops();
        if (isEditMode) {
            loadTransaction();
        }
    }, [id]);

    const loadCoops = async () => {
        try {
            const data = await coopService.getCoops();
            setCoops(data || []);
        } catch (error) {
            console.error("Error loading coops", error);
        }
    };

    const loadTransaction = async () => {
        setLoading(true);
        try {
            const data = await transactionService.getTransactionById(id);
            if (data) {
                const isPredefined = PREDEFINED_CATEGORIES.includes(data.category);
                setFormData({
                    amount: data.amount,
                    date: data.date,
                    categorySelect: isPredefined ? data.category : 'ALTRO',
                    customCategory: isPredefined ? '' : data.category,
                    supplier_id: data.supplier_id
                });

                // LOAD ITEMS if present
                if (data.transaction_items && data.transaction_items.length > 0) {
                    setShowInventory(true);
                    setItems(data.transaction_items.map(item => ({
                        tempId: item.id || Date.now() + Math.random(),
                        product: { id: item.products?.id || item.product_id, name: item.products?.name },
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        coop_id: data.coop_id || ''
                    })));
                }
            }
        } catch (error) {
            alert('Errore nel caricamento dati: ' + error.message);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // --- Inventory Handlers ---

    const handleAddItem = (product) => {
        if (!showInventory) setShowInventory(true);

        setItems([...items, {
            tempId: Date.now(),
            product: product,
            quantity: 1,
            unit_price: product.default_price || 0,
            coop_id: '' // General
        }]);
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item =>
            item.tempId === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.tempId !== id));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    // Update amount when items change
    useEffect(() => {
        if (items.length > 0) {
            setFormData(prev => ({ ...prev, amount: calculateTotal().toFixed(2) }));
        }
    }, [items]);


    // --- Form Handlers ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.date) return;

        setLoading(true);
        try {
            // CASE A: UPDATE EXISTING TRANSACTION (Edit Mode)
            if (isEditMode) {
                const category = formData.categorySelect === 'ALTRO'
                    ? (formData.customCategory || 'SPESA GENERICA')
                    : formData.categorySelect;

                const transactionData = {
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    category: category.toUpperCase(),
                    supplier_id: formData.supplier_id
                    // Note: We don't change coop_id here, it remains as is
                };

                // Use updateStockTransaction if we have items OR if we had items before (clearing them)
                // For simplicity, if showInventory is true, we use the stock update service
                if (items.length > 0 || showInventory) {
                    await inventoryService.updateStockTransaction(id, items, transactionData);
                } else {
                    await transactionService.updateTransaction(id, transactionData);
                }
            }
            // CASE B: INVENTORY LOAD (New, Items present)
            else if (items.length > 0) {
                if (!formData.supplier_id) {
                    alert("Per il carico magazzino serve un fornitore!");
                    setLoading(false);
                    return;
                }
                await inventoryService.saveStockLoad(items, formData.date, formData.supplier_id);
            }
            // CASE C: SIMPLE EXPENSE (New, No items)
            else {
                const category = formData.categorySelect === 'ALTRO'
                    ? (formData.customCategory || 'SPESA GENERICA')
                    : formData.categorySelect;

                const transactionData = {
                    type: 'expense',
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    category: category.toUpperCase(),
                    supplier_id: formData.supplier_id
                };

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
                <Button variant="ghost" onClick={() => navigate('/')} icon={<ArrowLeft size={20} />}>
                    Indietro
                </Button>
                <h2>{isEditMode ? 'Modifica Spesa' : 'Nuova Spesa'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="entry-form">

                {/* 1. CATEGORY BUTTONS (Top Priority) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {PREDEFINED_CATEGORIES.map(cat => {
                        const isSelected = formData.categorySelect === cat;
                        return (
                            <button
                                type="button"
                                key={cat}
                                onClick={() => setFormData(prev => ({ ...prev, categorySelect: cat }))}
                                style={{
                                    padding: '12px 4px',
                                    fontSize: '0.75rem',
                                    fontWeight: isSelected ? '700' : '500',
                                    borderRadius: '12px',
                                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg-secondary)',
                                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                    boxShadow: isSelected ? '0 2px 4px rgba(59,130,246,0.2)' : 'none'
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {formData.categorySelect === 'ALTRO' && (
                    <div className="slide-down" style={{ marginBottom: '16px' }}>
                        <Input
                            label="Specifica Categoria"
                            type="text"
                            name="customCategory"
                            value={formData.customCategory}
                            onChange={handleChange}
                            placeholder="Es. ELETTRICITÀ"
                            autoFocus
                        />
                    </div>
                )}

                {/* 2. AMOUNT (Big & Central) */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                        Importo Totale (€)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        readOnly={items.length > 0}
                        className={items.length > 0 ? "input-readonly" : ""}
                        style={{
                            width: '100%',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            padding: '12px',
                            textAlign: 'center',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--color-bg-primary)',
                            color: 'var(--color-text-primary)',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* 3. SECONDARY INFO (Date & Supplier) - Row Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                        <Input
                            label="Data"
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <CRMSelector
                            type="supplier"
                            label="Fornitore (Opz.)"
                            selectedId={formData.supplier_id}
                            onSelect={(id) => setFormData(prev => ({ ...prev, supplier_id: id }))}
                        />
                    </div>
                </div>

                {/* 4. SUBMIT BUTTON (Sticky-ish or Prominent) */}
                <Button
                    type="submit"
                    variant="danger"
                    size="lg"
                    isLoading={loading}
                    icon={<Save size={20} />}
                    className="submit-btn"
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                >
                    {isEditMode ? 'AGGIORNA SPESA' : (items.length > 0 ? 'SALVA CARICO' : 'SALVA SPESA')}
                </Button>

                {/* 5. INVENTORY (Collapsible/Optional) */}
                <div className="inventory-section" style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div
                        onClick={() => setShowInventory(!showInventory)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer', opacity: 0.8 }}
                    >
                        <Box size={20} className="text-muted" />
                        <h3 style={{ fontSize: '1rem', margin: 0 }}>
                            {showInventory ? 'Nascondi Prodotti' : 'Aggiungi Prodotti da Magazzino...'}
                        </h3>
                    </div>

                    {showInventory && (
                        <div className="slide-down">
                            <ProductSelector onSelect={handleAddItem} />

                            {/* Items List */}
                            {items.length > 0 ? (
                                <div className="items-list" style={{ marginTop: '12px' }}>
                                    {items.map(item => (
                                        <div key={item.tempId} className="stock-item-row" style={{
                                            background: 'var(--color-bg-secondary)',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            marginBottom: '8px',
                                            border: '1px solid var(--border-color)',
                                            animation: 'slideUp 0.2s ease'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 'bold' }}>{item.product.name}</span>
                                                <button type="button" onClick={() => removeItem(item.tempId)} style={{ color: 'var(--color-danger)', background: 'none', border: 'none' }}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="stock-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '8px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', opacity: 0.7 }}>Qta</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.tempId, 'quantity', parseFloat(e.target.value))}
                                                        style={{ padding: '4px 8px', height: '36px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', opacity: 0.7 }}>Prezzo</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(item.tempId, 'unit_price', parseFloat(e.target.value))}
                                                        style={{ padding: '4px 8px', height: '36px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.7rem', opacity: 0.7 }}>Destinazione</label>
                                                    <select
                                                        className="input-field"
                                                        value={item.coop_id}
                                                        onChange={(e) => updateItem(item.tempId, 'coop_id', e.target.value)}
                                                        style={{ padding: '0 4px', fontSize: '0.8rem', height: '36px' }}
                                                    >
                                                        <option value="">Generale</option>
                                                        {coops.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontStyle: 'italic', fontSize: '0.9rem' }}>
                                    Clicca o tocca un prodotto sopra per aggiungerlo.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddExpense;
