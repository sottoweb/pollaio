import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';
import { Egg } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/');
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
                    <Egg className="icon-gold mx-auto mb-2" size={48} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <h1>Benvenuto in Uova 4.0</h1>
                    <p>Accedi alla tua piattaforma</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%' }}>
                        Accedi
                    </Button>
                </form>

                <div className="auth-footer">
                    <p>
                        Non hai un account?{' '}
                        <Link to="/register" className="auth-link">
                            Registrati qui
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
