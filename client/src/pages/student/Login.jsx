import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaGraduationCap, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/student/login', { email, password });
            const { token, student } = response.data;
            login(token, student, 'student');
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-wrapper animate-fade">
            <div className="card auth-card glass">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        background: 'var(--primary)', 
                        color: 'white', 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.4)'
                    }}>
                        <FaGraduationCap size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>For Students</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back! Please login to your account.</p>
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
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="email" 
                                className="form-control" 
                                style={{ paddingLeft: '2.75rem' }}
                                placeholder="name@college.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <a href="/login" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '500', textDecoration: 'none' }}>Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }}>
                        Sign In <FaArrowRight size={14} style={{ marginLeft: '8px' }} />
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
