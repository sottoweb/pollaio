import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { organizationService } from '../services/organizationService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Egg, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import './Auth.css'; // Reusing Auth styles

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [inviteDetails, setInviteDetails] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Link non valido.");
            setLoading(false);
            return;
        }
        checkInvite();
    }, [token]);

    const checkInvite = async () => {
        try {
            const data = await organizationService.getInviteDetails(token);
            setInviteDetails(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!user) {
            // Store token in localStorage so we can redirect back after login/register
            localStorage.setItem('pendingInviteToken', token);
            navigate('/register?mode=invite');
            return;
        }

        setLoading(true);
        try {
            await organizationService.acceptInvitation(token);
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
                window.location.reload(); // Force refresh to update organization context
            }, 2000);
        } catch (err) {
            alert(err.message);
            setLoading(false);
        }
    };

    if (loading && !inviteDetails) {
        return <div className="auth-container"><div className="text-white">Verifica invito in corso...</div></div>;
    }

    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header mb-4">
                        <XCircle className="text-danger mx-auto mb-4" size={48} />
                        <h2>Ooops!</h2>
                        <p className="text-danger">{error}</p>
                    </div>
                    <Link to="/" className="btn btn-secondary w-full text-center">Torna alla Home</Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header mb-4">
                        <CheckCircle className="text-accent mx-auto mb-4" size={48} />
                        <h2>Benvenuto a Bordo!</h2>
                        <p>Ti sei unito con successo a <strong>{inviteDetails?.company_name}</strong>.</p>
                    </div>
                    <p className="text-center text-secondary">Ti stiamo reindirizzando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <Egg className="icon-gold mx-auto mb-4" size={48} />
                    <h1>Invito Ufficiale</h1>
                    <p>Sei stato invitato a unirti al team di:</p>
                    <div className="bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-[var(--border-color)] my-4">
                        <h3 className="text-xl font-bold text-white mb-1">{inviteDetails?.company_name}</h3>
                        <p className="text-secondary text-sm">per il ruolo di <span className="text-accent uppercase font-bold">{inviteDetails?.role}</span></p>
                    </div>
                </div>

                <div className="auth-form gap-4">
                    {user ? (
                        <div className="text-center mb-4">
                            <p className="text-sm text-secondary mb-2">Accetterai come:</p>
                            <div className="font-semibold text-white">{user.email}</div>
                        </div>
                    ) : (
                        <div className="alert alert-info mb-4 bg-blue-900/30 p-3 rounded text-sm text-blue-200 border border-blue-800">
                            Non sei loggato. Verrai reindirizzato alla registrazione.
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleAccept}
                        isLoading={loading}
                        className="w-full"
                        icon={<CheckCircle size={18} />}
                    >
                        {user ? 'Accetta e Unisciti' : 'Registrati per Accettare'}
                    </Button>

                    <Link to="/" className="btn btn-ghost w-full text-center mt-2">
                        Rifiuta / Ignora
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvite;
