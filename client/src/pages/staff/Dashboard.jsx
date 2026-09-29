import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FaListAlt, FaCheckCircle, FaExclamationCircle, FaClipboardList, FaSearch, FaEye, FaEnvelope, FaPhone, FaUniversity, FaBook, FaTag, FaCalendarAlt, FaHistory, FaExchangeAlt, FaCommentAlt, FaStickyNote, FaFireAlt, FaPaperclip } from 'react-icons/fa';
import Modal from '../../components/Modal';
import MessageThread from '../../components/MessageThread';
import AttachmentChip from '../../components/AttachmentChip';
import { isEscalated, getStatusSince, getDaysSince, ESCALATION_DAYS } from '../../utils/escalation';

// The staff dashboard mirrors the admin one but is deliberately narrower:
// only complaints assigned to this staff member are ever fetched (the
// backend enforces this too — /complaint/assigned-to-me — so there's no
// client-side filtering standing between staff and other departments'
// complaints), and there's no reassignment or note-deletion here, since
// those stay admin-only actions.
const StaffDashboard = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    const statusLabel = (s) => (
        s === 'closed' ? 'Closed' : s === 'pending' ? 'Pending' : 'Not Processed'
    );

    useEffect(() => {
        setNoteDraft('');
    }, [selectedComplaint?._id]);

    const fetchData = async () => {
        try {
            const res = await api.get('/complaint/assigned-to-me');
            setComplaints(res.data);
        } catch (err) {
            console.error('Failed to fetch assigned complaints', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stats = useMemo(() => {
        const s = { total: complaints.length, pending: 0, closed: 0, notProcessed: 0 };
        complaints.forEach(c => s[c.status]++);
        return s;
    }, [complaints]);

    const updateStatus = async (id, newStatus, note) => {
        try {
            const res = await api.put(`/complaint/update-status/${id}`, { status: newStatus, note });
            const updated = res.data.complaint;
            setComplaints(prev => prev.map(c => c._id === id ? updated : c));
            setSelectedComplaint(prev => (prev && prev._id === id) ? updated : prev);
            setNoteDraft('');
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to update status');
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
            alert(err?.response?.data?.message || 'Failed to add note');
        } finally {
            setSavingNote(false);
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
            if (!term) return true;
            return (
                c.studentId?.name?.toLowerCase().includes(term) ||
                c.studentId?.email?.toLowerCase().includes(term) ||
                c.complaintType?.name?.toLowerCase().includes(term) ||
                c.complaint?.toLowerCase().includes(term)
            );
        });
    }, [complaints, searchTerm, statusFilter]);

    return (
        <div className="container animate-fade">
            <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Assigned Complaints</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Welcome back, {user?.name || 'there'}. Only complaints routed to you show up here.
            </p>

            {/* Stats */}
            <div className="grid grid-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
                <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaListAlt size={22} style={{ color: 'var(--primary)' }} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Assigned</div>
                    </div>
                </div>
                <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaExclamationCircle size={22} style={{ color: 'var(--warning, #f59e0b)' }} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.pending}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending</div>
                    </div>
                </div>
                <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaClipboardList size={22} style={{ color: 'var(--text-muted)' }} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.notProcessed}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not Processed</div>
                    </div>
                </div>
                <div className="card glass" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaCheckCircle size={22} style={{ color: 'var(--success, #22c55e)' }} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.closed}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Closed</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '1 1 240px' }}>
                        <FaSearch style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by student, category, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <select
                        className="form-control"
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="notProcessed">Not Processed</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : filteredComplaints.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {complaints.length === 0 ? "Nothing's been assigned to you yet." : 'No complaints match your filters.'}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Student</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Category</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Submitted</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Update</th>
                                <th style={{ padding: '1rem 1.5rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComplaints.map((c) => (
                                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>{c.studentId?.name || 'Unknown Student'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.studentId?.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>{c.complaintType?.name || 'General'}</td>
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
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem 0.75rem' }}
                                            onClick={() => setSelectedComplaint(c)}
                                            title="View details"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
                                    <span className="badge badge-error" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <FaFireAlt size={10} /> ESCALATED — {getDaysSince(getStatusSince(selectedComplaint))}d
                                    </span>
                                )}
                            </div>
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

                        {/* Full description */}
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

                        {/* Activity & Notes — no delete here; only admins can remove a note */}
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
                                                    {n.type === 'status_change' ? <FaExchangeAlt /> : n.type === 'assignment' ? <FaCommentAlt /> : <FaStickyNote />}
                                                </div>
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
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                        {n.addedByEmail || 'Staff'} • {new Date(n.createdAt).toLocaleString()}
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

export default StaffDashboard;
