import React from 'react';
import { Egg } from 'lucide-react';
import Navigation from './Navigation';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo d-flex align-items-center gap-2">
                        <Egg className="icon-gold" size={32} />
                        <h1>Uova 2.0</h1>
                    </div>
                    <div className="user-profile">
                        {/* Placeholder for future user info */}
                        <div className="avatar">A</div>
                    </div>
                </div>
            </header>

            <main className="app-content">
                {children}
            </main>

            <Navigation />

            <footer className="app-footer">
                <p>© {new Date().getFullYear()} Gestione Avicola</p>
            </footer>
        </div>
    );
};

export default Layout;
