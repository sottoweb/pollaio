import React, { useState, useEffect } from 'react';
import { Plus, Package, Pencil } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import ProductManager from './ProductManager';
import './Input.css';

const ProductSelector = ({ onSelect }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showManager, setShowManager] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

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

    const handleCreate = () => {
        setEditingProduct(null);
        setShowManager(true);
    };

    const handleEdit = (e, product) => {
        e.stopPropagation();
        setEditingProduct(product);
        setShowManager(true);
    };

    const handleManagerSuccess = async (savedProduct) => {
        console.log("Product saved successfully, reloading list...", savedProduct);
        await loadProducts();
        // Force a small delay and reload again just in case of replication lag
        setTimeout(() => loadProducts(), 500);
    };

    const manualRefresh = (e) => {
        e.stopPropagation();
        loadProducts();
    };

    const handleTestCreate = async () => {
        try {
            window.alert("Avvio test creazione rapida...");
            await inventoryService.addProduct(
                "TEST_AUTO_" + Math.floor(Math.random() * 1000),
                9.99,
                'pz',
                'Descrizione test',
                null
            );
            window.alert("Test completato! Ricarico...");
            loadProducts();
        } catch (e) {
            window.alert("Test fallito: " + e.message);
        }
    };

    return (
        <div className="product-selector">
            <div style={{ display: 'none' }}></div>
            <div className="products-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '12px',
                marginBottom: '16px'
            }}>
                {products.map(p => (
                    <div
                        key={p.id}
                        onClick={() => onSelect(p)}
                        className="product-card slide-up"
                        style={{
                            position: 'relative',
                            aspectRatio: '1',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--color-bg-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end'
                        }}
                    >
                        {/* Background Image */}
                        {p.image_url ? (
                            <img
                                src={p.image_url}
                                alt={p.name}
                                style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    objectFit: 'cover', zIndex: 0
                                }}
                            />
                        ) : (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 0, opacity: 0.1
                            }}>
                                <Package size={40} />
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)',
                            zIndex: 1
                        }}></div>

                        {/* Edit Button */}
                        <button
                            type="button"
                            onClick={(e) => handleEdit(e, p)}
                            style={{
                                position: 'absolute', top: '6px', right: '6px',
                                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', // Darker background
                                border: '1px solid rgba(255,255,255,0.3)', // Subtle border
                                borderRadius: '50%', width: '28px', height: '28px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', cursor: 'pointer', zIndex: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)' // Shadow
                            }}
                        >
                            <Pencil size={14} />
                        </button>

                        {/* Text Content */}
                        <div style={{ position: 'relative', zIndex: 2, padding: '10px' }}>
                            <div style={{
                                color: 'white', fontWeight: 'bold', fontSize: '0.9rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)', lineHeight: 1.2,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                                {p.name}
                            </div>
                            <div style={{
                                color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem',
                                marginTop: '2px'
                            }}>
                                €{Number(p.default_price).toFixed(2)} / {p.unit}
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={handleCreate}
                    style={{
                        aspectRatio: '1',
                        padding: '12px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px dashed var(--color-success)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'var(--color-success)'
                    }}
                >
                    <Plus size={24} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nuovo</span>
                </button>
            </div>

            {showManager && (
                <ProductManager
                    onClose={() => setShowManager(false)}
                    onSuccess={handleManagerSuccess}
                    initialProduct={editingProduct}
                />
            )}
        </div>
    );
};

export default ProductSelector;
