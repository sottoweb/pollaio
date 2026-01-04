import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Camera, Trash2, Pencil } from 'lucide-react';
import { coopService } from '../services/coopService';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import './CoopDetails.css';

const CoopDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user from auth context
    const [coop, setCoop] = useState(null);
    const [breeds, setBreeds] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingBreedId, setEditingBreedId] = useState(null); // ID if editing
    const [formData, setFormData] = useState({ name: '', count: '', image: null });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const allCoops = await coopService.getCoops();
            const currentCoop = allCoops.find(c => c.id === id);
            setCoop(currentCoop);

            const breedsData = await coopService.getBreedsByCoop(id);
            setBreeds(breedsData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', count: '', image: null });
        setPreviewUrl(null);
        setEditingBreedId(null);
        setShowForm(false);
    }

    const handleEditClick = (e, breed) => {
        e.stopPropagation(); // Prevent navigation
        setEditingBreedId(breed.id);
        setFormData({
            name: breed.breed_name,
            count: breed.total_count,
            image: null
        });
        setPreviewUrl(breed.image_url);
        setShowForm(true);
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddOrUpdateBreed = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        setSubmitting(true);
        try {
            let imageUrl = previewUrl; // Keep old URL if no new image

            // If new image selected, upload it
            if (formData.image) {
                imageUrl = await coopService.uploadBreedImage(formData.image);
            }

            if (editingBreedId) {
                // UPDATE MODE
                await coopService.updateBreed(editingBreedId, {
                    breed_name: formData.name,
                    total_count: parseInt(formData.count) || 0,
                    image_url: imageUrl
                });
            } else {
                // CREATE MODE
                await coopService.addBreed({
                    coop_id: id,
                    breed_name: formData.name,
                    total_count: parseInt(formData.count) || 0,
                    image_url: imageUrl
                });
            }

            resetForm();
            loadData();
        } catch (error) {
            alert('Errore salvataggio razza: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!coop && !loading) return <div className="p-4">Pollaio non trovato</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <Button variant="ghost" onClick={() => navigate('/coops')} icon={<ArrowLeft size={20} />}>
                    Indietro
                </Button>
                <h2>{coop?.name}</h2>
            </div>

            <div className="breeds-section">
                <div className="section-header">
                    <h3>Razze allevate</h3>
                    <Button onClick={() => { resetForm(); setShowForm(!showForm); }} size="sm" icon={<Plus size={16} />}>
                        Aggiungi Razza
                    </Button>
                </div>

                {showForm && (
                    <form onSubmit={handleAddOrUpdateBreed} className="add-breed-form slide-down">
                        <h4 className="form-title">{editingBreedId ? 'Modifica Razza' : 'Nuova Razza'}</h4>
                        <div className="form-row">
                            <div className="photo-upload">
                                <input
                                    type="file"
                                    id="breed-photo"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleImageChange}
                                    className="hidden-input"
                                />
                                <label htmlFor="breed-photo" className="photo-placeholder">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" />
                                    ) : (
                                        <div className="camera-icon">
                                            <Camera size={24} />
                                            <span>Foto</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            <div className="inputs-col">
                                <Input
                                    label="Nome Razza"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Es. Livornese"
                                    required
                                />
                                <Input
                                    label="Numero Totale"
                                    type="number"
                                    value={formData.count}
                                    onChange={(e) => setFormData(prev => ({ ...prev, count: e.target.value }))}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button type="button" variant="ghost" onClick={resetForm}>Annulla</Button>
                            <Button type="submit" variant="primary" isLoading={submitting}>
                                {editingBreedId ? 'Salva Modifiche' : 'Salva Razza'}
                            </Button>
                        </div>
                    </form>
                )}

                <div className="breeds-grid">
                    {breeds.map(breed => (
                        <div
                            key={breed.id}
                            className="breed-card"
                            onClick={() => navigate(`/breed/${breed.id}`)}
                        >
                            <div className="breed-image">
                                {breed.image_url ? (
                                    <img src={breed.image_url} alt={breed.breed_name} />
                                ) : (
                                    <div className="no-image">🐔</div>
                                )}
                                {/* Edit Button overlay */}
                                <button className="edit-breed-btn" onClick={(e) => handleEditClick(e, breed)}>
                                    <Pencil size={14} />
                                </button>
                            </div>
                            <div className="breed-info">
                                <h4>{breed.breed_name}</h4>
                                <div className="breed-count">
                                    <span className="badge">{breed.total_count} Galline</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {breeds.length === 0 && !showForm && (
                        <div className="empty-msg">Nessuna razza in questo pollaio.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoopDetails;
