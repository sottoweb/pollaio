import React from 'react';
import { Egg, Grid } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <Link to="/" className="logo d-flex align-items-center gap-2" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Egg className="icon-gold" size={32} />
                        <h1>Uova 2.0</h1>
                    </Link>
                    <div className="header-actions">
                        <NavLink to="/coops" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            <Grid size={20} />
                            <span>Pollai</span>
                        </NavLink>
                        <div className="user-profile">
                            <div className="avatar">A</div>
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
