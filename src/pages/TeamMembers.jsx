import React, { useState, useEffect } from 'react';
import { organizationService } from '../services/organizationService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { Users, Mail, Copy, Trash2, Shield, UserPlus } from 'lucide-react';
import './TeamMembers.css';

const TeamMembers = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);

    // Invite Form
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        if (user?.orgId) loadTeamData();
    }, [user]);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            const [membersData, invitesData] = await Promise.all([
                organizationService.getMembers(user.orgId),
                organizationService.getInvitations(user.orgId)
            ]);
            setMembers(membersData || []);
            setInvitations(invitesData || []);
        } catch (error) {
            console.error("Error loading team:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        try {
            await organizationService.createInvitation(user.orgId, inviteEmail, inviteRole);
            setInviteEmail('');
            loadTeamData(); // Refresh list
        } catch (error) {
            alert("Errore invito: " + error.message);
        } finally {
            setInviting(false);
        }
    };

    const handleDeleteInvite = async (id) => {
        if (!window.confirm("Annullare questo invito?")) return;
        try {
            await organizationService.deleteInvitation(id);
            loadTeamData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveMember = async (id) => {
        if (!window.confirm("Rimuovere questo membro dal team?")) return;
        try {
            await organizationService.removeMember(id);
            loadTeamData();
        } catch (error) {
            alert("Errore rimozione membro: " + error.message);
        }
    };

    const copyInviteLink = (token) => {
        const link = `${window.location.origin}/accept-invite?token=${token}`;
        navigator.clipboard.writeText(link);
        alert("Link copiato negli appunti! Invialo al collega.");
    };

    if (loading) return <div className="p-8 text-center">Caricamento Team...</div>;

    return (
        <div className="page-container max-w-4xl mx-auto">
            <div className="page-header mb-8">
                <h2>Gestione Team</h2>
                <p className="text-secondary">Collabora con i tuoi soci e dipendenti</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* --- LEFT COLUMN: INVITE FORM --- */}
                <div className="md:col-span-1">
                    <div className="bg-[var(--color-bg-secondary)] p-6 rounded-xl border border-[var(--border-color)]">
                        <div className="flex items-center gap-2 mb-4 text-[var(--color-accent)]">
                            <UserPlus size={24} />
                            <h3 className="text-lg font-bold m-0 text-primary">Nuovo Invito</h3>
                        </div>
                        <p className="text-sm text-secondary mb-4">
                            Inserisci l'email del collaboratore. Genereremo un link unico da inviare.
                        </p>
                        <form onSubmit={handleInvite} className="flex flex-col gap-4">
                            <Input
                                label="Email Collaboratore"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="collega@email.com"
                                required
                            />
                            <div className="form-group">
                                <label className="form-label">Ruolo</label>
                                <select
                                    className="form-select"
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="member">Membro (Accesso Standard)</option>
                                    <option value="admin">Admin (Gestione Totale)</option>
                                </select>
                            </div>
                            <Button type="submit" variant="primary" isLoading={inviting} className="w-full">
                                Genera Invito
                            </Button>
                        </form>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: LISTS --- */}
                <div className="md:col-span-2 flex flex-col gap-8">

                    {/* ACTIVE MEMBERS */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Users size={20} /> Membri Attivi ({members.length})
                        </h3>
                        <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                            {members.length === 0 ? (
                                <div className="p-4 text-center text-secondary">Nessun membro trovato.</div>
                            ) : (
                                <div className="divide-y divide-[var(--border-color)]">
                                    {members.map(member => (
                                        <div key={member.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar-sm bg-accent text-primary font-bold hidden sm:flex">
                                                    {member.profiles?.first_name?.[0] || member.profiles?.email?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold">
                                                        {member.profiles?.first_name} {member.profiles?.last_name}
                                                    </div>
                                                    <div className="text-xs text-secondary">{member.profiles?.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`badge ${member.role === 'owner' ? 'badge-gold' : 'badge-gray'}`}>
                                                    {member.role === 'owner' ? 'Proprietario' : member.role}
                                                </span>
                                                {member.role !== 'owner' && (
                                                    <button
                                                        className="action-icon text-danger"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        title="Rimuovi"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PENDING INVITATIONS */}
                    {invitations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Mail size={20} /> Inviti in Attesa ({invitations.length})
                            </h3>
                            <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                                <div className="divide-y divide-[var(--border-color)]">
                                    {invitations.map(invite => (
                                        <div key={invite.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="font-semibold text-sm">{invite.email}</div>
                                                <div className="text-xs text-secondary">Ruolo: {invite.role}</div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => copyInviteLink(invite.token)}
                                                    icon={<Copy size={14} />}
                                                >
                                                    Copia Link
                                                </Button>
                                                <button
                                                    className="action-icon text-danger"
                                                    onClick={() => handleDeleteInvite(invite.id)}
                                                    title="Annulla Invito"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TeamMembers;
