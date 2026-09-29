import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaArrowRight, FaCalendar, FaPhone, FaMapMarkerAlt, FaCity, FaBuilding, FaBook } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', fatherName: '', email: '', gender: 'Male', password: '', 
        address: '', mobile: '', dob: '', sessionId: '', city: '', 
        pincode: '', course: '', collegeId: '', picture: ''
    });
    const [colleges, setColleges] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [collegeRes, sessionRes] = await Promise.all([
                    api.get('/college/get-all'),
                    api.get('/session/get-all')
                ]);
                setColleges(collegeRes.data);
                setSessions(sessionRes.data);
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };
        fetchDropdownData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/student/register', formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-wrapper animate-fade" style={{ alignItems: 'flex-start', padding: '3rem 1rem' }}>
            <div className="card glass" style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        background: 'var(--primary)', color: 'white', width: '60px', height: '60px', 
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.4)'
                    }}>
                        <FaGraduationCap size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Student Registration</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Create your account to access the Grievance Redressal System.</p>
                </div>

                {error && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{error}</div>}
                {success && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{success}</div>}

                <form onSubmit={handleSubmit} className="grid grid-2">
                    {/* Personal Information */}
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" name="name" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.name} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Father's Name</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" name="fatherName" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.fatherName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" name="email" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="password" name="password" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.password} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select name="gender" className="form-control" value={formData.gender} onChange={handleChange} required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <div style={{ position: 'relative' }}>
                            <FaCalendar style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="date" name="dob" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.dob} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Contact & Address */}
                    <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <div style={{ position: 'relative' }}>
                            <FaPhone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="tel" name="mobile" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.mobile} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaMapMarkerAlt style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" name="address" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.address} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">City</label>
                        <div style={{ position: 'relative' }}>
                            <FaCity style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" name="city" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.city} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Pincode</label>
                        <div style={{ position: 'relative' }}>
                            <FaMapMarkerAlt style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" name="pincode" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.pincode} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="form-group">
                        <label className="form-label">College</label>
                        <div style={{ position: 'relative' }}>
                            <FaBuilding style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select name="collegeId" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.collegeId} onChange={handleChange} required>
                                <option value="">Select College</option>
                                {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Course</label>
                        <div style={{ position: 'relative' }}>
                            <FaBook style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" name="course" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.course} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Session</label>
                        <div style={{ position: 'relative' }}>
                            <FaCalendar style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select name="sessionId" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.sessionId} onChange={handleChange} required>
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Profile Picture URL</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="url" name="picture" className="form-control" style={{ paddingLeft: '2.75rem' }} value={formData.picture} onChange={handleChange} placeholder="https://example.com/pic.jpg" />
                        </div>
                    </div>

                    <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Register Account <FaArrowRight size={14} style={{ marginLeft: '8px' }} />
                        </button>
                        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign In here</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
