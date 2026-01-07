import React, { useState, useRef } from 'react';
import { X, Upload, Package, DollarSign, FileText, Loader, Trash2 } from 'lucide-react';
import Button from './Button';
import './Input.css';
import { inventoryService } from '../services/inventoryService';

const ProductManager = ({ onClose, onSuccess, initialProduct = null }) => {
    const [name, setName] = useState(initialProduct?.name || '');
    const [price, setPrice] = useState(initialProduct?.default_price || '');
    const [description, setDescription] = useState(initialProduct?.description || '');
    const [imagePreview, setImagePreview] = useState(initialProduct?.image_url || null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const isEditMode = !!initialProduct;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileToUpload(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Immagine (se presente)
            let imageUrl = initialProduct?.image_url;
            if (fileToUpload) {
                try {
                    imageUrl = await inventoryService.uploadProductImage(fileToUpload);
                } catch (imgErr) {
                    console.error("Errore upload immagine:", imgErr);
                    if (!window.confirm("Errore caricamento immagine. Vuoi salvare comunque il prodotto senza foto?")) {
                        setLoading(false);
                        return; // Stop se utente annulla
                    }
                }
            } else if (fileToUpload === null && !imagePreview) {
                imageUrl = null;
            }

            // 2. Preparazione Dati
            const cleanPrice = String(price).replace(',', '.');
            const finalPrice = parseFloat(cleanPrice);

            if (isNaN(finalPrice)) {
                alert("Il prezzo non è valido.");
                setLoading(false);
                return;
            }

            const productData = {
                name: name.trim(),
                default_price: finalPrice,
                description: description || '',
                image_url: imageUrl
            };

            // 3. Invio (Edit o Create)
            let result;
            if (isEditMode) {
                if (!initialProduct?.id) throw new Error("ID Prodotto mancante");
                result = await inventoryService.updateProduct(initialProduct.id, productData);
            } else {
                result = await inventoryService.addProduct(
                    productData.name,
                    productData.default_price,
                    'pz',
                    productData.description,
                    productData.image_url
                );
            }

            if (result) {
                // Successo pieno
                onSuccess(result);
                onClose();
            } else {
                // Fallback silenzioso o log
                onSuccess(result);
                onClose();
            }

        } catch (error) {
            console.error(error);
            alert(`Errore: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', pading: '20px'
        }}>
            <div className="card slide-up" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>{isEditMode ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Image Uploader */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100px', height: '100px',
                                borderRadius: '12px', border: '2px dashed var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                                backgroundColor: 'var(--color-bg-secondary)'
                            }}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Upload size={24} className="text-muted" />
                            )}

                            {imagePreview && (
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); setImagePreview(null); setFileToUpload(null); }}
                                    style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: 2, color: 'white' }}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {imagePreview ? 'Clicca per cambiare' : 'Carica Foto'}
                        </span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Basic Info */}
                    <div className="input-group">
                        <Package size={20} className="input-icon" />
                        <input
                            type="text"
                            placeholder="Nome Prodotto (es. Mais)"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            // remove required as we validate manually
                            className="input-field"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="input-group" style={{ flex: 1 }}>
                            <DollarSign size={20} className="input-icon" />
                            <input
                                type="number"
                                placeholder="Prezzo Default"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                min="0"
                                step="0.01"
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <FileText size={20} className="input-icon" />
                        <textarea
                            placeholder="Descrizione (opzionale)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="input-field"
                            style={{ minHeight: '80px', resize: 'vertical', paddingTop: '10px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {isEditMode && (
                            <Button
                                type="button"
                                onClick={async () => {
                                    if (window.confirm("Sei sicuro di voler eliminare questo prodotto?")) {
                                        setLoading(true);
                                        try {
                                            await inventoryService.deleteProduct(initialProduct.id);
                                            onSuccess(null); // Pass null or specific signal for deletion
                                            onClose();
                                        } catch (err) {
                                            console.error(err);
                                            alert("Errore durante l'eliminazione");
                                            setLoading(false);
                                        }
                                    }
                                }}
                                variant="danger"
                                disabled={loading}
                                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white' }}
                            >
                                <Trash2 size={20} />
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            variant="primary"
                            disabled={loading}
                            style={{ flex: 3 }}
                        >
                            {loading ? <Loader className="spin" size={20} /> : (isEditMode ? 'Salva Modifiche' : 'Crea Prodotto')}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductManager;
