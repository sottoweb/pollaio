import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { coopService } from '../services/coopService';
import Button from '../components/Button';
import Input from '../components/Input';
import './BreedDetails.css';

const BreedDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [breed, setBreed] = useState(null);
    const [hens, setHens] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Hen Form
    const [showForm, setShowForm] = useState(false);
    const [newHen, setNewHen] = useState({
        name: '',
        notes: '',
        birth_date: '',
        provenance: '',
        sex: 'F'
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const breedData = await coopService.getBreedById(id);
            setBreed(breedData);

            const hensData = await coopService.getHensByBreed(id);
            setHens(hensData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTotal = async () => {
        const newCount = prompt("Modifica numero totale galline:", breed.total_count);
        if (newCount !== null && !isNaN(newCount)) {
            if (parseInt(newCount) < hens.length) {
                alert(`Attenzione: Hai già inserito ${hens.length} galline singole. Non puoi scendere sotto questo numero.`);
                return;
            }
            await coopService.updateBreedCount(id, parseInt(newCount));
            loadData();
        }
    };

    const handleAddHen = async (e) => {
        e.preventDefault();

        // VALIDATION: Check constraint
        if (hens.length >= breed.total_count) {
            alert(`Limite raggiunto! Hai dichiarato ${breed.total_count} galline. Aumenta il totale prima di aggiungerne altre.`);
            return;
        }

        try {
            await coopService.addHen({
                coop_breed_id: id,
                name_id: newHen.name,
                notes: newHen.notes,
                birth_date: newHen.birth_date || null,
                provenance: newHen.provenance,
                sex: newHen.sex
            });
            setNewHen({ name: '', notes: '', birth_date: '', provenance: '', sex: 'F' });
            setShowForm(false);
            loadData();
        } catch (error) {
            alert("Errore aggiunta gallina: " + error.message);
        }
    };

    const handleDeleteHen = async (henId) => {
        if (window.confirm("Rimuovere questa gallina?")) {
            await coopService.deleteHen(henId);
            loadData();
        }
    }

    if (!breed && !loading) return <div className="p-4">Razza non trovata</div>;

    const progress = breed ? (hens.length / breed.total_count) * 100 : 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <Button variant="ghost" onClick={() => navigate(`/coops/${breed?.coop_id}`)} icon={<ArrowLeft size={20} />}>
                    Indietro
                </Button>
                <div className="header-titles">
                    <span className="subtitle">{breed?.coops?.name}</span>
                    <h2>{breed?.breed_name}</h2>
                </div>
            </div>

            <div className="summary-card">
                <div className="summary-row">
                    <div>
                        <span className="label">Totale Dichiarato</span>
                        <div className="value-row">
                            <span className="value">{breed?.total_count}</span>
                            <button className="edit-link" onClick={handleUpdateTotal}>Modifica</button>
                        </div>
                    </div>
                    <div>
                        <span className="label">Schede Inserite</span>
                        <span className="value">{hens.length}</span>
                    </div>
                </div>

                <div className="progress-bar-container">
                    <div
                        className={`progress-bar ${progress === 100 ? 'full' : ''}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                </div>
                {hens.length < (breed?.total_count || 0) ? (
                    <p className="hint">Puoi inserire ancora {breed.total_count - hens.length} schede gallina.</p>
                ) : (
                    <p className="hint full">Hai completato il censimento per questa razza.</p>
                )}
            </div>

            <div className="hens-section">
                <div className="section-header">
                    <h3>Dettaglio Galline</h3>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        size="sm"
                        icon={<Plus size={16} />}
                        disabled={hens.length >= (breed?.total_count || 0)}
                    >
                        Aggiungi
                    </Button>
                </div>

                {showForm && (
                    <form onSubmit={handleAddHen} className="add-hen-form slide-down">
                        <Input
                            label="Nome o Identificativo"
                            value={newHen.name}
                            onChange={(e) => setNewHen(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Es. 001 o Rosina"
                            required
                        />

                        <div className="form-row">
                            <div className="input-group">
                                <label className="input-label">Sesso</label>
                                <select
                                    className="input-field select-field"
                                    value={newHen.sex}
                                    onChange={(e) => setNewHen(prev => ({ ...prev, sex: e.target.value }))}
                                >
                                    <option value="F">Gallina</option>
                                    <option value="M">Gallo</option>
                                </select>
                            </div>
                            <Input
                                label="Data Nascita"
                                type="date"
                                value={newHen.birth_date}
                                onChange={(e) => setNewHen(prev => ({ ...prev, birth_date: e.target.value }))}
                            />
                        </div>

                        <Input
                            label="Provenienza"
                            value={newHen.provenance}
                            onChange={(e) => setNewHen(prev => ({ ...prev, provenance: e.target.value }))}
                            placeholder="Es. Consorzio Agrario"
                        />

                        <Input
                            label="Note (Opzionale)"
                            value={newHen.notes}
                            onChange={(e) => setNewHen(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Es. Anello Rosso"
                        />
                        <Button type="submit" variant="primary">Salva Scheda</Button>
                    </form>
                )}

                <div className="hens-list">
                    {hens.map(hen => (
                        <div key={hen.id} className="hen-item">
                            <div className="hen-icon">
                                {hen.sex === 'M' ? '🐓' : '🐔'}
                            </div>
                            <div className="hen-info">
                                <strong>{hen.name_id}</strong>
                                <div className="hen-details">
                                    {hen.birth_date && <span>Nata: {new Date(hen.birth_date).toLocaleDateString()}</span>}
                                    {hen.provenance && <span> • Prov: {hen.provenance}</span>}
                                </div>
                                {hen.notes && <span className="hen-notes">{hen.notes}</span>}
                            </div>
                            <button className="btn-icon-only" onClick={() => handleDeleteHen(hen.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {hens.length === 0 && !showForm && (
                        <div className="empty-msg">Nessuna scheda gallina inserita.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BreedDetails;
