import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { crmService } from '../services/crmService';
import './Input.css'; // Re-use input styling

const CRMSelector = ({ type, selectedId, onSelect }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadItems();
    }, [type]);

    const loadItems = async () => {
        try {
            const data = type === 'customer'
                ? await crmService.getCustomers()
                : await crmService.getSuppliers();
            setItems(data || []);
        } catch (error) {
            console.error("Error loading CRM data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = async () => {
        const label = type === 'customer' ? 'Cliente' : 'Fornitore';
        const name = window.prompt(`Inserisci il nome del nuovo ${label}:`);

        if (name && name.trim()) {
            try {
                const newItem = type === 'customer'
                    ? await crmService.addCustomer(name.trim())
                    : await crmService.addSupplier(name.trim());

                if (newItem) {
                    setItems([...items, newItem]);
                    onSelect(newItem.id); // Auto-select
                }
            } catch (error) {
                alert(`Errore creazione ${label}: ` + error.message);
            }
        }
    };

    return (
        <div className="crm-selector-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
                <label className="input-label">
                    {type === 'customer' ? 'Cliente' : 'Fornitore'}
                </label>
                <select
                    className="input-field"
                    value={selectedId || ''}
                    onChange={(e) => onSelect(e.target.value)}
                    disabled={loading}
                    style={{ backgroundColor: 'var(--color-bg-secondary)', width: '100%' }}
                >
                    <option value="">-- Seleziona --</option>
                    {items.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddNew}
                style={{ height: '42px', padding: '0 12px' }}
                title={`Aggiungi ${type === 'customer' ? 'Cliente' : 'Fornitore'}`}
            >
                <Plus size={20} />
            </button>
        </div>
    );
};

export default CRMSelector;
