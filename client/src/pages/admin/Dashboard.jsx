import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaListAlt, FaUsers, FaCheckCircle, FaExclamationCircle, FaUserShield, FaBuilding, FaLayerGroup, FaSearch, FaEye, FaEnvelope, FaPhone, FaUniversity, FaBook, FaTag, FaCalendarAlt, FaHistory, FaExchangeAlt, FaCommentAlt, FaStickyNote, FaTrash, FaUserTag, FaSave, FaFireAlt, FaPaperclip } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import MessageThread from '../../components/MessageThread';
import AttachmentChip from '../../components/AttachmentChip';
import { isEscalated, getStatusSince, getDaysSince, ESCALATION_DAYS } from '../../utils/escalation';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [complaints, setComplaints] = useState([]);
    const [students, setStudents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalCom: 0, pending: 0, closed: 0, notProcessed: 0, totalStu: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [assignStaffId, setAssignStaffId] = useState('');
    const [manualAssignMode, setManualAssignMode] = useState(false);
    const [assignDraft, setAssignDraft] = useState('');
    const [assignEmailDraft, setAssignEmailDraft] = useState('');
    const [savingAssign, setSavingAssign] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [escalatedOnly, setEscalatedOnly] = useState(false);

    const statusLabel = (s) => (
        s === 'closed' ? 'Closed' : s === 'pending' ? 'Pending' : 'Not Processed'
    );

    // Staff registered for the currently-open complaint's type — these
    // are the assignment dropdown's options. Falls back to manual entry
    // when no staff exists yet for that department.
    const eligibleStaff = useMemo(() => {
        if (!selectedComplaint?.complaintType?._id) return [];
        return staffList.filter(
            s => s.active && s.complaintType?._id === selectedComplaint.complaintType._id
        );
    }, [staffList, selectedComplaint]);

    // Reset drafts whenever a different complaint is opened
    useEffect(() => {
        setNoteDraft('');
        setAssignStaffId(selectedComplaint?.assignedStaffId || '');
        setAssignDraft(selectedComplaint?.assignedTo || '');
        setAssignEmailDraft(selectedComplaint?.assignedToEmail || '');
        setManualAssignMode(false);
    }, [selectedComplaint?._id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compRes, stuRes, staffRes] = await Promise.all([
                    api.get('/complaint/get-all'),
                    api.get('/student/all'),
                    api.get('/staff/get-all')
                ]);
                
                setComplaints(compRes.data);
                setStudents(stuRes.data);
                setStaffList(staffRes.data);
                
                const s = { totalCom: compRes.data.length, pending: 0, closed: 0, notProcessed: 0, totalStu: stuRes.data.length };
                compRes.data.forEach(c => s[c.status]++);
                setStats(s);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Supports links from assignment notification emails
    // (?complaintId=...) by opening that complaint once it's loaded.
    useEffect(() => {
        const targetId = searchParams.get('complaintId');
        if (!targetId || complaints.length === 0) return;
        const match = complaints.find(c => c._id === targetId);
        if (match) {
            setSelectedComplaint(match);
        }
        const next = new URLSearchParams(searchParams);
        next.delete('complaintId');
        setSearchParams(next, { replace: true });
    }, [complaints, searchParams, setSearchParams]);

    const updateStatus = async (id, newStatus, note) => {
        try {
            const res = await api.put(`/complaint/update-status/${id}`, { status: newStatus, note });
            const updated = res.data.complaint;
            setComplaints(prev => prev.map(c => c._id === id ? updated : c));
            setSelectedComplaint(prev => (prev && prev._id === id) ? updated : prev);
            setNoteDraft('');
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const addNote = async (id) => {
        if (!noteDraft.trim()) return;
        setSavingNote(true);
        try {
            const res = await api.post(`/complaint/${id}/notes`, { text: noteDraft.trim() });
            const updated = res.data.complaint;
            setComplaints(prev => prev.map(c => c._id === id ? updated : c));
            setSelectedComplaint(prev => (prev && prev._id === id) ? updated : prev);
            setNoteDraft('');
        } catch (err) {
            alert('Failed to add note');
        } finally {
            setSavingNote(false);
        }
    };

    const deleteNote = async (complaintId, noteId) => {
        if (!window.confirm('Delete this note? This cannot be undone.')) return;
        try {
            const res = await api.delete(`/complaint/${complaintId}/notes/${noteId}`);
            const updated = res.data.complaint;
            setComplaints(prev => prev.map(c => c._id === complaintId ? updated : c));
            setSelectedComplaint(prev => (prev && prev._id === complaintId) ? updated : prev);
        } catch (err) {
            alert('Failed to delete note');
        }
    };

    const assignComplaint = async (id, payload) => {
        setSavingAssign(true);
        try {
            const res = await api.put(`/complaint/${id}/assign`, payload);
            const updated = res.data.complaint;
            setComplaints(prev => prev.map(c => c._id === id ? updated : c));
            setSelectedComplaint(prev => (prev && prev._id === id) ? updated : prev);
            if ((payload.staffId || payload.assignedToEmail) && !res.data.emailSent) {
                alert('Assignment saved, but the notification email could not be sent. (Is SMTP configured on the server?)');
            }
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to update assignment');
        } finally {
            setSavingAssign(false);
        }
    };

    const sendMessage = async (text, file) => {
        if (!selectedComplaint) return;
        setSendingMessage(true);
        try {
            const payload = new FormData();
            if (text) payload.append('text', text);
            if (file) payload.append('attachment', file);

            const res = await api.post(`/complaint/${selectedComplaint._id}/messages`, payload);
            const updated = res.data.complaint;
            setComplaints(prev => prev.map(c => c._id === selectedComplaint._id ? updated : c));
            setSelectedComplaint(updated);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const filteredComplaints = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return complaints.filter((c) => {
            const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
            if (!matchesStatus) return false;
            if (escalatedOnly && !isEscalated(c)) return false;
            if (!term) return true;
            return (
                c.studentId?.name?.toLowerCase().includes(term) ||
                c.studentId?.email?.toLowerCase().includes(term) ||
                c.complaintType?.name?.toLowerCase().includes(term) ||
                c.complaint?.toLowerCase().includes(term) ||
                c.assignedTo?.toLowerCase().includes(term)
            );
        });
    }, [complaints, searchTerm, statusFilter, escalatedOnly]);

    const escalatedCount = useMemo(
        () => complaints.filter(isEscalated).length,
        [complaints]
    );

    return (
        <div className="container animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>System Overview and Grievance Management.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/manage-entities" className="btn btn-outline">
                        <FaBuilding style={{ marginRight: '8px' }} /> Setup Entities
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-4" style={{ marginBottom: '2.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: 'var(--admin)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaListAlt size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Total Grievances</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.totalCom}</h3>
                    </div>
                </div>
                
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: 'var(--warning)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaExclamationCircle size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Action Needed</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.pending + stats.notProcessed}</h3>
                    </div>
                </div>

                <button
                    onClick={() => setEscalatedOnly((v) => !v)}
                    className="card"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem',
                        cursor: 'pointer', border: escalatedOnly ? '2px solid var(--error)' : '1px solid var(--border)',
                        textAlign: 'left', font: 'inherit'
                    }}
                    title={`Complaints pending more than ${ESCALATION_DAYS} days — click to filter the table`}
                >
                    <div style={{ background: 'var(--error)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaFireAlt size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Escalated</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{escalatedCount}</h3>
                    </div>
                </button>

                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px' }}>
                        <FaUsers size={24} />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: '500', marginBottom: '0.25rem' }}>Registered Students</p>
                        <h3 style={{ fontSize: '1.75rem' }}>{stats.totalStu}</h3>
                    </div>
                </div>
            </div>

            {/* All Complaints Table */}
            <div className="card" style={{ padding: '0' }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>All Grievances</h3>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search student, type, or text..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '2.25rem', minWidth: '240px', fontSize: '0.875rem' }}
                            />
                        </div>
                        <select
                            className="form-control"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: 'auto', fontSize: '0.875rem' }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="notProcessed">Not Processed</option>
                            <option value="pending">Pending</option>
                            <option value="closed">Closed</option>
                        </select>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap'
                        }}>
                            <input
                                type="checkbox"
                                checked={escalatedOnly}
                                onChange={(e) => setEscalatedOnly(e.target.checked)}
                            />
                            Escalated only
                        </label>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading system data...</div>
                    ) : complaints.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>No grievances found in system.</h4>
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <h4 style={{ color: 'var(--text-muted)' }}>No grievances match your search/filter.</h4>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--background)' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Student / ID</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Type</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Description</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Assigned To</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Date</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Current Status</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.875rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredComplaints.map((c) => (
                                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: '500' }}>{c.studentId?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{c._id.slice(-6).toUpperCase()}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{c.complaintType?.name || 'Unknown'}</td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', maxWidth: '260px' }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.6rem'
                                            }}>
                                                <span style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block',
                                                    maxWidth: '190px'
                                                }}>
                                                    {c.complaint}
                                                </span>
                                                <button
                                                    onClick={() => setSelectedComplaint(c)}
                                                    title="View full details"
                                                    style={{
                                                        background: 'var(--neutral-bg)',
                                                        color: 'var(--primary)',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        width: '30px',
                                                        height: '30px',
                                                        flexShrink: 0,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaEye size={13} />
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            {c.assignedTo ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', width: 'fit-content' }}>
                                                        <FaUserTag size={11} /> {c.assignedTo}
                                                        {c.assignedStaffId && (
                                                            <span title="Real staff account — they can log in and see this" style={{ color: '#16a34a', fontSize: '0.7rem' }}>●</span>
                                                        )}
                                                    </span>
                                                    {c.assignedToEmail && (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            <FaEnvelope size={10} /> {c.assignedToEmail}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Unassigned</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span className={`badge ${c.status === 'closed' ? 'badge-success' : c.status === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
                                                    {c.status.toUpperCase()}
                                                </span>
                                                {isEscalated(c) && (
                                                    <span
                                                        className="badge badge-error"
                                                        title={`Pending for ${getDaysSince(getStatusSince(c))} days`}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <FaFireAlt size={10} /> ESCALATED
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <select 
                                                className="form-control" 
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', width: 'auto' }}
                                                value={c.status}
                                                onChange={(e) => updateStatus(c._id, e.target.value)}
                                            >
                                                <option value="notProcessed">Not Processed</option>
                                                <option value="pending">Pending</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Complaint Details Modal */}
            <Modal
                open={!!selectedComplaint}
                onClose={() => setSelectedComplaint(null)}
                title="Grievance Details"
            >
                {selectedComplaint && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{selectedComplaint.studentId?.name || 'Unknown Student'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{selectedComplaint._id.slice(-6).toUpperCase()}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className={`badge ${selectedComplaint.status === 'closed' ? 'badge-success' : selectedComplaint.status === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
                                    {selectedComplaint.status.toUpperCase()}
                                </span>
                                {isEscalated(selectedComplaint) && (
                                    <span
                                        className="badge badge-error"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <FaFireAlt size={10} /> ESCALATED — {getDaysSince(getStatusSince(selectedComplaint))}d
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Assigned To */}
                        <div>
                            <div className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><FaUserTag style={{ marginRight: '6px' }} />Assigned To</span>
                                {eligibleStaff.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setManualAssignMode(m => !m)}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                                    >
                                        {manualAssignMode ? 'Choose from staff list instead' : "Assign manually (no account)"}
                                    </button>
                                )}
                            </div>

                            {!manualAssignMode && eligibleStaff.length > 0 ? (
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <select
                                        className="form-control"
                                        value={assignStaffId || ''}
                                        onChange={(e) => setAssignStaffId(e.target.value)}
                                        style={{ flex: '1 1 220px' }}
                                    >
                                        <option value="">— Unassigned —</option>
                                        {eligibleStaff.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                        ))}
                                    </select>
                                    <button
                                        className="btn btn-primary"
                                        disabled={savingAssign || (assignStaffId || '') === (selectedComplaint.assignedStaffId || '')}
                                        onClick={() => assignComplaint(selectedComplaint._id, { staffId: assignStaffId || null })}
                                        style={{ flex: '0 0 auto' }}
                                    >
                                        {savingAssign ? 'Saving...' : <><FaSave style={{ marginRight: '6px' }} /> Save</>}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. Hostel Warden - Mr. Sharma"
                                            value={assignDraft}
                                            onChange={(e) => setAssignDraft(e.target.value)}
                                            style={{ flex: '1 1 200px' }}
                                        />
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="Their email (optional — sends a notification)"
                                            value={assignEmailDraft}
                                            onChange={(e) => setAssignEmailDraft(e.target.value)}
                                            style={{ flex: '1 1 220px' }}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            disabled={
                                                savingAssign ||
                                                (assignDraft === (selectedComplaint.assignedTo || '') &&
                                                    assignEmailDraft === (selectedComplaint.assignedToEmail || ''))
                                            }
                                            onClick={() => assignComplaint(selectedComplaint._id, { assignedTo: assignDraft, assignedToEmail: assignEmailDraft })}
                                            style={{ flex: '0 0 auto' }}
                                        >
                                            {savingAssign ? 'Saving...' : <><FaSave style={{ marginRight: '6px' }} /> Save</>}
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                        <FaEnvelope style={{ marginRight: '4px' }} />
                                        {eligibleStaff.length === 0
                                            ? "No staff registered for this complaint type yet — add one under Manage Entities, or notify someone by email only (they won't get a login)."
                                            : "This person has no login — they'll get a one-time notification email but can't act on the complaint directly."}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Student contact & academic info */}
                        <div className="grid grid-2" style={{ gap: '0.75rem' }}>
                            {selectedComplaint.studentId?.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <FaEnvelope style={{ color: 'var(--primary)' }} />
                                    <a href={`mailto:${selectedComplaint.studentId.email}`} style={{ color: 'inherit' }}>
                                        {selectedComplaint.studentId.email}
                                    </a>
                                </div>
                            )}
                            {selectedComplaint.studentId?.mobile && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <FaPhone style={{ color: 'var(--primary)' }} />
                                    {selectedComplaint.studentId.mobile}
                                </div>
                            )}
                            {selectedComplaint.studentId?.collegeId?.name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <FaUniversity style={{ color: 'var(--primary)' }} />
                                    {selectedComplaint.studentId.collegeId.name}
                                </div>
                            )}
                            {selectedComplaint.studentId?.course && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <FaBook style={{ color: 'var(--primary)' }} />
                                    {selectedComplaint.studentId.course}
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <FaTag style={{ color: 'var(--primary)' }} />
                                {selectedComplaint.complaintType?.name || 'Unknown category'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <FaCalendarAlt style={{ color: 'var(--primary)' }} />
                                Submitted {new Date(selectedComplaint.createdAt).toLocaleString()}
                            </div>
                            {selectedComplaint.updatedAt && selectedComplaint.updatedAt !== selectedComplaint.createdAt && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <FaHistory style={{ color: 'var(--primary)' }} />
                                    Last updated {new Date(selectedComplaint.updatedAt).toLocaleString()}
                                </div>
                            )}
                        </div>

                        {/* Full description — no more truncation */}
                        <div>
                            <div className="form-label" style={{ marginBottom: '0.5rem' }}>Full Description</div>
                            <div style={{
                                background: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '1rem',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                color: 'var(--text-main)',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}>
                                {selectedComplaint.complaint}
                            </div>
                        </div>

                        {/* Attachments submitted with the complaint */}
                        {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                            <div>
                                <div className="form-label" style={{ marginBottom: '0.5rem' }}>
                                    <FaPaperclip style={{ marginRight: '6px' }} />Attachments
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                    {selectedComplaint.attachments.map((a, i) => (
                                        <AttachmentChip key={i} attachment={a} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Two-way conversation with the student */}
                        <div>
                            <div className="form-label" style={{ marginBottom: '0.5rem' }}>Conversation with Student</div>
                            <MessageThread
                                messages={selectedComplaint.messages || []}
                                currentRole="admin"
                                onSend={sendMessage}
                                sending={sendingMessage}
                            />
                        </div>

                        {/* Activity & Audit Trail */}
                        <div>
                            <div className="form-label" style={{ marginBottom: '0.5rem' }}>Activity &amp; Notes</div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.85rem',
                                maxHeight: '220px',
                                overflowY: 'auto',
                                paddingRight: '4px',
                                marginBottom: '1rem'
                            }}>
                                {(!selectedComplaint.notes || selectedComplaint.notes.length === 0) ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                                        No activity yet — status changes and notes will show up here.
                                    </p>
                                ) : (
                                    [...selectedComplaint.notes]
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .map((n) => (
                                            <div key={n._id} style={{ display: 'flex', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    background: 'var(--neutral-bg)', color: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0, fontSize: '0.75rem'
                                                }}>
                                                    {n.type === 'status_change' ? <FaExchangeAlt /> : n.type === 'assignment' ? <FaUserTag /> : <FaStickyNote />}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            {n.type === 'status_change' && (
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                                                    Status changed {n.fromStatus ? `from ${statusLabel(n.fromStatus)} ` : ''}
                                                                    to {statusLabel(n.toStatus)}
                                                                </div>
                                                            )}
                                                            {n.type === 'assignment' && (
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                                                    {n.toAssignee
                                                                        ? (n.fromAssignee ? `Reassigned from ${n.fromAssignee} to ${n.toAssignee}` : `Assigned to ${n.toAssignee}`)
                                                                        : `Unassigned${n.fromAssignee ? ` (was ${n.fromAssignee})` : ''}`}
                                                                    {n.toAssigneeEmail && (
                                                                        <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> — notified {n.toAssigneeEmail}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {n.text && (
                                                                <div style={{
                                                                    fontSize: '0.85rem',
                                                                    color: 'var(--text-main)',
                                                                    marginTop: n.type === 'status_change' ? '0.25rem' : 0,
                                                                    wordBreak: 'break-word'
                                                                }}>
                                                                    {n.text}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {n.type === 'note' && (
                                                            <button
                                                                onClick={() => deleteNote(selectedComplaint._id, n._id)}
                                                                title="Delete note"
                                                                style={{
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    color: 'var(--text-muted)',
                                                                    cursor: 'pointer',
                                                                    padding: '2px',
                                                                    flexShrink: 0,
                                                                    display: 'flex'
                                                                }}
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                        {n.addedByEmail || 'Admin'} • {new Date(n.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>

                            <textarea
                                className="form-control"
                                rows={2}
                                placeholder="e.g. Contacted the student, awaiting their response..."
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                style={{ resize: 'vertical', marginBottom: '0.75rem' }}
                            />

                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-outline"
                                    disabled={!noteDraft.trim() || savingNote}
                                    onClick={() => addNote(selectedComplaint._id)}
                                    style={{ flex: '1 1 160px' }}
                                >
                                    {savingNote ? 'Saving...' : <><FaStickyNote style={{ marginRight: '6px' }} /> Save Note</>}
                                </button>
                                <select
                                    className="form-control"
                                    value={selectedComplaint.status}
                                    onChange={(e) => updateStatus(selectedComplaint._id, e.target.value, noteDraft)}
                                    style={{ flex: '1 1 160px' }}
                                >
                                    <option value="notProcessed">Not Processed</option>
                                    <option value="pending">Pending</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                                Changing the status above will also save whatever note you've typed in.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;
