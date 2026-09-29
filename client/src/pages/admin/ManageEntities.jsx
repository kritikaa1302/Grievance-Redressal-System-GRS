import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaBuilding, FaCalendarAlt, FaTags, FaUserTie, FaPlus, FaTrash, FaPowerOff } from 'react-icons/fa';

const emptyGenericItem = { name: '', description: '' };
const emptyStaffItem = { name: '', email: '', password: '', complaintType: '' };

const ManageEntities = () => {
    const [activeTab, setActiveTab] = useState('colleges');
    const [entities, setEntities] = useState([]);
    const [complaintTypes, setComplaintTypes] = useState([]);
    const [newItem, setNewItem] = useState(emptyGenericItem);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Generic tabs (colleges/sessions/types) all follow the same
    // name+description CRUD shape. Staff is its own shape (name, email,
    // password, department) so it's handled separately below rather than
    // being squeezed into this map.
    const endpoints = {
        colleges: { fetch: '/college/get-all', create: '/college/create', delete: '/college/delete' },
        sessions: { fetch: '/session/get-all', create: '/session/create', delete: '/session/delete' },
        types: { fetch: '/complaintType/get-all', create: '/complaintType/create', delete: '/complaintType/delete' }
    };

    const isStaffTab = activeTab === 'staff';

    const fetchEntities = async () => {
        setLoading(true);
        try {
            if (isStaffTab) {
                const res = await api.get('/staff/get-all');
                setEntities(res.data);
            } else {
                const res = await api.get(endpoints[activeTab].fetch);
                setEntities(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch entities", err);
        } finally {
            setLoading(false);
        }
    };

    // Complaint types are needed for the staff "department" dropdown
    // regardless of which tab is active, since a staff member must be
    // tied to one — fetch once on mount.
    useEffect(() => {
        api.get('/complaintType/get-all')
            .then(res => setComplaintTypes(res.data))
            .catch(err => console.error('Failed to fetch complaint types', err));
    }, []);

    useEffect(() => {
        fetchEntities();
        setNewItem(isStaffTab ? emptyStaffItem : emptyGenericItem);
        setFormError('');
    }, [activeTab]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            if (isStaffTab) {
                await api.post('/staff/create', newItem);
                setNewItem(emptyStaffItem);
            } else {
                await api.post(endpoints[activeTab].create, newItem);
                setNewItem(emptyGenericItem);
            }
            fetchEntities();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Failed to create entity');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            if (isStaffTab) {
                await api.delete(`/staff/${id}`);
            } else {
                await api.delete(`${endpoints[activeTab].delete}/${id}`);
            }
            fetchEntities();
        } catch (err) {
            alert('Failed to delete entity. It might be in use.');
        }
    };

    const handleToggleActive = async (id) => {
        try {
            await api.put(`/staff/${id}/toggle-active`);
            fetchEntities();
        } catch (err) {
            alert('Failed to update staff status');
        }
    };

    return (
        <div className="container animate-fade">
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Entity Management</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure Colleges, Academic Sessions, Complaint Categories, and Staff.</p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                    className={`btn ${activeTab === 'colleges' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('colleges')}
                    style={{ gap: '0.5rem' }}
                >
                    <FaBuilding /> Colleges
                </button>
                <button
                    className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('sessions')}
                    style={{ gap: '0.5rem' }}
                >
                    <FaCalendarAlt /> Sessions
                </button>
                <button
                    className={`btn ${activeTab === 'types' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('types')}
                    style={{ gap: '0.5rem' }}
                >
                    <FaTags /> Complaint Types
                </button>
                <button
                    className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('staff')}
                    style={{ gap: '0.5rem' }}
                >
                    <FaUserTie /> Faculty / Staff
                </button>
            </div>

            <div className="grid grid-2" style={{ gap: '2rem' }}>
                {/* Create Form */}
                <div className="card glass">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                        Add New {activeTab === 'colleges' ? 'College' : activeTab === 'sessions' ? 'Session' : activeTab === 'types' ? 'Complaint Type' : 'Staff Member'}
                    </h3>

                    {formError && (
                        <div style={{
                            background: 'var(--error-bg)',
                            color: 'var(--error)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1.25rem',
                            fontSize: '0.875rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {formError}
                        </div>
                    )}

                    {isStaffTab ? (
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Mr. Sharma"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email (used to log in)</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="warden@college.edu"
                                    value={newItem.email}
                                    onChange={(e) => setNewItem({ ...newItem, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Temporary Password</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="At least 6 characters"
                                    value={newItem.password}
                                    onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Department (Complaint Type)</label>
                                <select
                                    className="form-control"
                                    value={newItem.complaintType}
                                    onChange={(e) => setNewItem({ ...newItem, complaintType: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select a complaint type...</option>
                                    {complaintTypes.map(ct => (
                                        <option key={ct._id} value={ct._id}>{ct.name}</option>
                                    ))}
                                </select>
                                {complaintTypes.length === 0 && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                        No complaint types exist yet — add one under the "Complaint Types" tab first.
                                    </p>
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }}>
                                <FaPlus /> Create Staff Account
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.5rem' }}>
                                <FaPlus /> Create Entry
                            </button>
                        </form>
                    )}
                </div>

                {/* List */}
                <div className="card" style={{ padding: '0' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Existing Entries</h3>
                    </div>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
                    ) : entities.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No entries found.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {entities.map(item => (
                                <li key={item._id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                    {isStaffTab ? (
                                        <>
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {item.name}
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '999px',
                                                        background: item.active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.2)',
                                                        color: item.active ? '#16a34a' : 'var(--text-muted)'
                                                    }}>
                                                        {item.active ? 'Active' : 'Deactivated'}
                                                    </span>
                                                </h4>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.email}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Handles: {item.complaintType?.name || 'Unknown'}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.5rem' }}
                                                    onClick={() => handleToggleActive(item._id)}
                                                    title={item.active ? 'Deactivate' : 'Reactivate'}
                                                >
                                                    <FaPowerOff />
                                                </button>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem' }}
                                                    onClick={() => handleDelete(item._id)}
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.description}</p>
                                            </div>
                                            <button
                                                className="btn btn-outline"
                                                style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem' }}
                                                onClick={() => handleDelete(item._id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageEntities;
