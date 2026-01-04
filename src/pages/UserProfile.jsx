import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { organizationService } from '../services/organizationService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { User, Building, Save, Camera } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Personal Data
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Load Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFirstName(profile.first_name || '');
                setLastName(profile.last_name || '');
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updates = {
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date(),
            };
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            alert('Dati personali aggiornati!');
        } catch (error) {
            alert('Errore: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Caricamento...</div>;

    return (
        <div className="page-container max-w-4xl mx-auto">
            <div className="page-header mb-8">
                <h2>Impostazioni Account</h2>
            </div>

            <div className="form-card slide-up">
                <div className="card-header">
                    <h3>Il tuo Profilo</h3>
                    <p>Gestisci le tue informazioni di accesso</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="form-layout">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <Input
                            label="Cognome"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <Input
                        label="Email"
                        value={user.email}
                        disabled
                        className="opacity-60 cursor-not-allowed"
                        hint="L'email non può essere modificata."
                    />
                    <div className="form-footer">
                        <Button type="submit" variant="primary" icon={<Save size={18} />} isLoading={saving}>
                            Salva Profilo
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
