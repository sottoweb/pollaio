import React, { useState, useRef, useEffect } from 'react';
import { Egg, Grid, LogOut, User, ChevronDown, Users } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './Layout.css';

const Layout = ({ children }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const initial = user?.email ? user.email[0].toUpperCase() : 'U';

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <Link to="/" className="logo d-flex align-items-center gap-2" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Egg className="icon-gold" size={32} />
                        <h1>Uova 2.0</h1>
                    </Link>
                    <div className="header-actions">
                        <NavLink to="/production" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Egg size={20} />
                            <span>Raccolta</span>
                        </NavLink>
                        <NavLink to="/coops" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Grid size={20} />
                            <span>Pollai</span>
                        </NavLink>
                        <div className="user-menu-container" ref={dropdownRef}>
                            <button
                                className="user-menu-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className="avatar">{initial}</div>
                                <ChevronDown size={16} className={`chevron ${dropdownOpen ? 'rotate' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="dropdown-menu slide-down-sm">
                                    <div className="dropdown-header">
                                        <span className="user-email">{user?.email}</span>
                                    </div>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <User size={16} />
                                        <span>Il mio Profilo</span>
                                    </Link>

                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <LogOut size={16} />
                                        <span>Esci</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="app-content">
                {children}
            </main>



            <footer className="app-footer">
                <p>© {new Date().getFullYear()} Gestione Avicola</p>
            </footer>
        </div>
    );
};

export default Layout;
