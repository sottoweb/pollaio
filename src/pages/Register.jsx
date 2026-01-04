import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';
import { Egg } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        companyName: ''
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                    },
                },
            });

            if (authError) throw authError;

            // 2. Create Organization (Manually for now, better via Edge Function later)
            // But since RLS is on, we need to be careful. 
            // The user is created. The trigger creates the profile.
            // Now we create the organization for this user.

            const userId = authData.user?.id;
            if (userId && formData.companyName) {
                // Wait a moment for trigger to create profile? Usually fast enough.
                const { data: orgData, error: orgError } = await supabase
                    .from('organizations')
                    .insert([{
                        name: formData.companyName,
                        owner_id: userId
                    }])
                    .select()
                    .single();

                if (orgError) {
                    console.error("Org creation failed, continuing anyway", orgError);
                } else if (orgData) {
                    // Add user as owner in members
                    await supabase
                        .from('organization_members')
                        .insert([{
                            organization_id: orgData.id,
                            user_id: userId,
                            role: 'owner'
                        }]);
                }
            }

            alert("Registrazione completata! Controlla la tua email per confermare.");
            navigate('/login');

        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Egg className="icon-gold" size={48} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <h1>Crea Account</h1>
                    <p>Inizia a gestire il tuo allevamento</p>
                </div>

                <form onSubmit={handleRegister} className="auth-form">
                    <Input
                        label="Nome Titolare"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                    />
                    <Input
                        label="Nome Azienda / Pollaio"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Es. Cascina Avicola"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%' }}>
                        Registrati
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Hai già un account?{' '}
                        <Link to="/login" className="auth-link">
                            Accedi qui
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
