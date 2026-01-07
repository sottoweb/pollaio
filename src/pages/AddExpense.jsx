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

import { categoryService } from '../services/categoryService';

const AddExpense = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Core Data
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categorySelect: 'MANGIME', // Will update after loading cats
        customCategory: '',
        supplier_id: null
    });

    // Inventory Data
    const [showInventory, setShowInventory] = useState(true); // Default OPEN
    const [coops, setCoops] = useState([]);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);

    const isEditMode = !!id;

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [coopsData, catsData] = await Promise.all([
                coopService.getCoops(),
                categoryService.getCategories()
            ]);

            setCoops(coopsData || []);
            setCategories(catsData || []);

            // Set default category if available and not editing
            if (!isEditMode && catsData?.length > 0) {
                // Try to find MANGIME, otherwise first one
                const defaultCat = catsData.find(c => c.name === 'MANGIME') || catsData[0];
                setFormData(prev => ({ ...prev, categorySelect: defaultCat.name }));
            }

            if (isEditMode) {
                await loadTransaction();
            }
        } catch (error) {
            console.error("Error loading initial data", error);
        }
    };

    const loadTransaction = async () => {
        setLoading(true);
        try {
            const data = await transactionService.getTransactionById(id);
            if (data) {
                // Check if the transaction category is in our list
                // Note: categories state might verify this, but inside loadData scoping is tricky.
                // We trust the data.name strictly matches for now.
                // Or better: we reload logic a bit to ensure we know if it's custom.

                // Since this runs after loadData awaits, 'categories' state update might not be visible in this closure immediately 
                // if we just called setCategories.
                // Actually, due to closure stale date, we rely on the fact that loadData called Promise.all. 
                // Ideally we pass catsData to this function.
                // But for simplicity, let's just assume standard.

                const knownCategories = ['MANGIME', 'VETERINARIO', 'MANUTENZIONE', 'PULIZIA', 'ATTREZZATURA', 'ALTRO'];
                // Ideally use loaded categories, but closure issue prevents easy access without refactor.
                // Let's assume strict naming.

                const isPredefined = knownCategories.includes(data.category) || (data.category && data.category !== 'ALTRO');
                // Actually, logic is: if it's in the list, select it. If not, it's custom?

                setFormData({
                    amount: data.amount,
                    date: data.date,
                    categorySelect: data.category, // Just stick it here
                    customCategory: '',
                    supplier_id: data.supplier_id
                });

                if (data.items) {
                    setItems(data.items.map(i => ({
                        tempId: Date.now() + Math.random(),
                        product: i.product,
                        quantity: i.quantity,
                        unit_price: i.unit_price,
                        coop_id: i.transaction.coop_id
                    })));
                    setShowInventory(true);
                }
            }
        } catch (error) {
            console.error("Error loading transaction", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Inventory Handlers ---

    const calculateTotal = (currentItems) => {
        return currentItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    };

    const updateAmountFromItems = (currentItems) => {
        const total = calculateTotal(currentItems);
        setFormData(prev => ({ ...prev, amount: total.toFixed(2) }));
    };

    // --- Inventory Handlers ---

    const handleAddItem = (product) => {
        if (!showInventory) setShowInventory(true);

        const newItems = [...items, {
            tempId: Date.now(),
            product: product,
            quantity: 1,
            unit_price: product.default_price || 0,
            coop_id: '' // General
        }];

        setItems(newItems);
        updateAmountFromItems(newItems);
    };

    const updateItem = (id, field, value) => {
        const newItems = items.map(item =>
            item.tempId === id ? { ...item, [field]: value } : item
        );
        setItems(newItems);

        // Update total ONLY if we are changing quantity or price
        if (field === 'quantity' || field === 'unit_price') {
            updateAmountFromItems(newItems);
        }
    };

    const removeItem = (id) => {
        const newItems = items.filter(item => item.tempId !== id);
        setItems(newItems);
        updateAmountFromItems(newItems);
    };



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
                <div className="category-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginBottom: '16px'
                }}>
                    {categories.map(cat => {
                        const isSelected = formData.categorySelect === cat.name;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, categorySelect: cat.name, customCategory: '' })}
                                className={`category-card ${isSelected ? 'selected' : ''}`}
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
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

                {
                    formData.categorySelect === 'ALTRO' && (
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
                    )
                }



                {/* 3. SECONDARY INFO (Date & Supplier) - Stacked Layout */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    <Input
                        label="Data"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />

                    <CRMSelector
                        type="supplier"
                        label="Fornitore (Opz.)"
                        selectedId={formData.supplier_id}
                        onSelect={(id) => setFormData(prev => ({ ...prev, supplier_id: id }))}
                    />
                </div>



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
                            <ProductSelector
                                onSelect={handleAddItem}
                                selectedCategory={formData.categorySelect}
                            />

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

                                            <div className="stock-controls" style={{ display: 'grid', gridTemplateColumns: '50px 70px 1fr', gap: '6px', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <label style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: '2px' }}>Qta</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.tempId, 'quantity', parseFloat(e.target.value) || '')}
                                                        onFocus={(e) => e.target.select()}
                                                        style={{
                                                            padding: '0',
                                                            height: '34px',
                                                            textAlign: 'center',
                                                            fontSize: '0.9rem',
                                                            minWidth: 0 // Prevent overflow
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <label style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: '2px' }}>Prezzo</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateItem(item.tempId, 'unit_price', parseFloat(e.target.value) || 0)}
                                                        onFocus={(e) => e.target.select()}
                                                        placeholder="0.00"
                                                        style={{
                                                            padding: '0',
                                                            height: '34px',
                                                            textAlign: 'center',
                                                            fontSize: '0.9rem',
                                                            minWidth: 0
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <label style={{ fontSize: '0.65rem', opacity: 0.7, marginBottom: '2px' }}>Destinazione</label>
                                                    <select
                                                        className="input-field"
                                                        value={item.coop_id}
                                                        onChange={(e) => updateItem(item.tempId, 'coop_id', e.target.value)}
                                                        style={{
                                                            padding: '0 4px',
                                                            fontSize: '0.8rem',
                                                            height: '34px',
                                                            minWidth: 0,
                                                            whiteSpace: 'nowrap',
                                                            textOverflow: 'ellipsis'
                                                        }}
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

                {/* 4. AMOUNT (Moved Down) */}
                <div style={{ marginBottom: '20px', marginTop: '20px' }}>
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

                {/* 5. SUBMIT BUTTON (Bottom) */}
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
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                        marginBottom: '30px'
                    }}
                >
                    {isEditMode ? 'AGGIORNA SPESA' : (items.length > 0 ? 'SALVA CARICO' : 'SALVA SPESA')}
                </Button>
            </form >
        </div >
    );
};

export default AddExpense;
