import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaUserCircle, FaSignOutAlt, FaHome, FaPlusCircle, FaListAlt, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/image.png';

const Navbar = () => {
    const { user, role, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate('/');
    };

    const linkStyle = { textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' };

    const NavLinks = ({ onNavigate }) => (
        <>
            <Link to="/" className="nav-link" style={linkStyle} onClick={onNavigate}>
                <FaHome /> Home
            </Link>

            {!user ? (
                <>
                    <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1.25rem' }} onClick={onNavigate}>Login</Link>
                    <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }} onClick={onNavigate}>Register</Link>
                </>
            ) : (
                <>
                    {role === 'student' && (
                        <>
                            <Link to="/student/dashboard" className="nav-link" style={linkStyle} onClick={onNavigate}>
                                <FaListAlt /> Dashboard
                            </Link>
                            <Link to="/student/raise-complaint" className="nav-link" style={linkStyle} onClick={onNavigate}>
                                <FaPlusCircle /> Raise Complaint
                            </Link>
                        </>
                    )}

                    {role === 'admin' && (
                        <Link to="/admin/dashboard" className="nav-link" style={linkStyle} onClick={onNavigate}>
                            <FaListAlt /> Dashboard
                        </Link>
                    )}

                    {role === 'staff' && (
                        <Link to="/staff/dashboard" className="nav-link" style={linkStyle} onClick={onNavigate}>
                            <FaListAlt /> My Assigned Complaints
                        </Link>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUserCircle size={20} color="var(--primary)" />
                        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name || 'Admin'}</span>
                    </div>
                    <button onClick={handleLogout} className="btn" style={{ background: 'transparent', color: 'var(--error)', padding: '4px', fontSize: '1.2rem', display: 'flex' }} title="Logout">
                        <FaSignOutAlt />
                    </button>
                </>
            )}
        </>
    );

    return (
        <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, marginBottom: '2rem', padding: '1rem 0' }}>
            <div className="navbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                    <img src={logo} alt="logo" style={{ width: '44px', height: '44px' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>GRS Portal</span>
                </Link>

                {/* Desktop links */}
                <div className="desktop-nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <NavLinks />
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <FaSun /> : <FaMoon />}
                    </button>
                </div>

                {/* Mobile controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle mobile-menu-btn"
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle dark mode"
                    >
                        {isDark ? <FaSun /> : <FaMoon />}
                    </button>
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="theme-toggle mobile-menu-btn"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div
                    className="navbar-inner animate-fade"
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border)' }}
                >
                    <NavLinks onNavigate={() => setMenuOpen(false)} />
                </div>
            )}
        </nav>
    );
};

export default Navbar;
