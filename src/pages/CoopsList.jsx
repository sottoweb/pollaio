import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Home, Trash2 } from 'lucide-react';
import { coopService } from '../services/coopService';
import Button from '../components/Button';
import Input from '../components/Input';
import './CoopsList.css';

const CoopsList = () => {
    const navigate = useNavigate();
    const [coops, setCoops] = useState([]);
    const [stats, setStats] = useState({}); // Map coop_id -> total_hens
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newCoopName, setNewCoopName] = useState('');

    useEffect(() => {
        loadCoops();
    }, []);

    const loadCoops = async () => {
        setLoading(true);
        try {
            const [coopsData, breedsData] = await Promise.all([
                coopService.getCoops(),
                coopService.getAllBreeds()
            ]);

            setCoops(coopsData || []);

            // Calculate totals
            const newStats = {};
            if (breedsData) {
                breedsData.forEach(b => {
                    if (!newStats[b.coop_id]) newStats[b.coop_id] = 0;
                    newStats[b.coop_id] += (b.total_count || 0);
                });
            }
            setStats(newStats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoop = async (e) => {
        e.preventDefault();
        if (!newCoopName.trim()) return;

        try {
            await coopService.addCoop({ name: newCoopName });
            setNewCoopName('');
            setShowForm(false);
            loadCoops();
        } catch (error) {
            alert('Errore aggiunta pollaio');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Eliminare questo pollaio e tutte le sue galline?')) {
            await coopService.deleteCoop(id);
            loadCoops();
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>I Miei Pollai</h2>
                <Button onClick={() => setShowForm(!showForm)} icon={<Plus size={20} />}>
                    Nuovo
                </Button>
            </div>

            {showForm && (
                <form onSubmit={handleAddCoop} className="add-form slide-down">
                    <Input
                        label="Nome Pollaio"
                        value={newCoopName}
                        onChange={(e) => setNewCoopName(e.target.value)}
                        placeholder="Es. Pollaio Nord"
                        autoFocus
                    />
                    <div className="form-actions">
                        <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annulla</Button>
                        <Button type="submit" variant="primary">Salva</Button>
                    </div>
                </form>
            )}

            <div className="coops-grid">
                {coops.map(coop => (
                    <div
                        key={coop.id}
                        className="coop-card"
                        onClick={() => navigate(`/coops/${coop.id}`)}
                    >
                        <div className="coop-icon">
                            <Home size={32} />
                        </div>
                        <div className="coop-info">
                            <h3>{coop.name}</h3>
                            <div className="coop-badge">
                                {stats[coop.id] || 0} Galline
                            </div>
                        </div>
                        <button className="delete-btn-corner" onClick={(e) => handleDelete(e, coop.id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {coops.length === 0 && !loading && (
                    <div className="empty-state">Nessun pollaio presente. Aggiungine uno!</div>
                )}
            </div>
        </div>
    );
};

export default CoopsList;
