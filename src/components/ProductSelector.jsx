import React, { useState, useEffect } from 'react';
import { Plus, Package } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import Button from './Button';
import './Input.css';

const ProductSelector = ({ onSelect }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await inventoryService.getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        const name = window.prompt("Nome nuovo prodotto (es. Granoturco 25kg):");
        if (!name) return;

        const priceStr = window.prompt("Prezzo standard (opzionale):", "0");
        const price = parseFloat(priceStr) || 0;

        try {
            const newProduct = await inventoryService.addProduct(name, price);
            if (newProduct) {
                setProducts([...products, newProduct]);
                onSelect(newProduct);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="product-selector">
            <div className="products-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '8px',
                marginBottom: '16px'
            }}>
                {products.map(p => (
                    <button
                        key={p.id}
                        type="button"
                        onClick={() => onSelect(p)}
                        className="product-btn"
                        style={{
                            padding: '12px',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            textAlign: 'center'
                        }}
                    >
                        <Package size={20} className="text-muted" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.name}</span>
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleAdd}
                    style={{
                        padding: '12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px dashed var(--color-success)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--color-success)'
                    }}
                >
                    <Plus size={20} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nuovo</span>
                </button>
            </div>
        </div>
    );
};

export default ProductSelector;
