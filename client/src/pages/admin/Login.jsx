import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaUserShield, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import logo from '../../assets/image.png';
const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/login', { email, password });
            const { token, admin, role } = response.data;
            login(token, admin, role);
            navigate(role === 'staff' ? '/staff/dashboard' : '/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-wrapper animate-fade">
            <div className="card auth-card glass">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        background: 'var(--admin)',
                        color: 'white', 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 16px rgba(var(--admin-rgb), 0.4)'
                    }}>
                        <img src={logo} alt="logo" style={{ width: '50px', height: '50px' }} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Admin & Staff Login</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Secure access to the system backend.</p>
                </div>

                {error && (
                    <div style={{ 
                        background: 'var(--error-bg)', 
                        color: 'var(--error)', 
                        padding: '0.75rem 1rem', 
                        borderRadius: 'var(--radius)', 
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Admin Email</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="email" 
                                className="form-control" 
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="admin@grs.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Administration Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="password" 
                                className="form-control" 
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--admin)', boxShadow: '0 4px 14px 0 rgba(var(--admin-rgb), 0.39)' }}>
                        Secure Login <FaArrowRight size={14} style={{ marginLeft: '8px' }} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
