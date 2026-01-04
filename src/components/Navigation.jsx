import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Settings } from 'lucide-react';
import './Navigation.css';

const Navigation = () => {
    return (
        <nav className="bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end
            >
                <Home size={24} />
                <span>Home</span>
            </NavLink>

            <NavLink
                to="/coops"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <Grid size={24} />
                <span>Pollai</span>
            </NavLink>
        </nav>
    );
};

export default Navigation;
