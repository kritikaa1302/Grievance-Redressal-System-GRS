import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaPlusCircle, FaArrowRight, FaCommentAlt, FaTags, FaPaperclip, FaTimes } from 'react-icons/fa';

const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 5;

const RaiseComplaint = () => {
    const [complaintTypes, setComplaintTypes] = useState([]);
    const [formData, setFormData] = useState({
        complaintType: '',
        complaint: ''
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await api.get('/complaintType/get-all');
                setComplaintTypes(response.data);
            } catch (err) {
                console.error("Failed to fetch complaint types", err);
                setError('Failed to load complaint categories. Please try again later.');
            }
        };
        fetchTypes();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        e.target.value = ''; // allow re-selecting the same file after removing it

        if (files.length + selected.length > MAX_FILES) {
            setError(`You can attach at most ${MAX_FILES} files.`);
            return;
        }
        const tooBig = selected.find((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
        if (tooBig) {
            setError(`"${tooBig.name}" is larger than ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        setError('');
        setFiles((prev) => [...prev, ...selected]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const payload = new FormData();
            payload.append('complaintType', formData.complaintType);
            payload.append('complaint', formData.complaint);
            files.forEach((f) => payload.append('attachments', f));

            await api.post('/complaint/create', payload);
            setSuccess('Grievance submitted successfully!');
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>Raise a Grievance</h2>
                <p style={{ color: 'var(--text-muted)' }}>Fill out the form below to submit a new complaint. Please be as detailed as possible.</p>
            </div>

            <div className="card glass">
                {error && <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{error}</div>}
                {success && <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Complaint Category</label>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Select the category that best fits your issue.</p>
                        
                        <div style={{ position: 'relative' }}>
                            <FaTags style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select 
                                name="complaintType" 
                                className="form-control" 
                                style={{ paddingLeft: '2.75rem', paddingRight: '1rem', height: '3rem', fontSize: '1rem' }} 
                                value={formData.complaintType} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select a category...</option>
                                {complaintTypes.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Complaint Description</label>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Provide a detailed explanation of your problem.</p>
                        
                        <div style={{ position: 'relative' }}>
                            <FaCommentAlt style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
                            <textarea 
                                name="complaint" 
                                className="form-control" 
                                style={{ paddingLeft: '2.75rem', minHeight: '150px', resize: 'vertical', paddingTop: '1rem' }} 
                                placeholder="Describe your issue here..."
                                value={formData.complaint} 
                                onChange={handleChange} 
                                required
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>Attachments (optional)</label>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            Add up to {MAX_FILES} photos or PDFs — a picture of the issue helps a lot (max {MAX_FILE_SIZE_MB}MB each).
                        </p>

                        <input
                            type="file"
                            id="raise-complaint-files"
                            accept="image/*,.pdf"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <label
                            htmlFor="raise-complaint-files"
                            className="btn btn-outline"
                            style={{ display: 'inline-flex', cursor: files.length >= MAX_FILES ? 'not-allowed' : 'pointer', opacity: files.length >= MAX_FILES ? 0.5 : 1 }}
                        >
                            <FaPaperclip style={{ marginRight: '8px' }} /> Choose Files
                        </label>

                        {files.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1rem' }}>
                                {files.map((f, i) => (
                                    <div
                                        key={`${f.name}-${i}`}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            fontSize: '0.8rem', color: 'var(--text-main)',
                                            background: 'var(--neutral-bg)', padding: '0.4rem 0.6rem', borderRadius: '8px'
                                        }}
                                    >
                                        <FaPaperclip size={11} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            title="Remove"
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                                        >
                                            <FaTimes size={11} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/student/dashboard')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
                            {loading ? 'Submitting...' : <><FaPlusCircle style={{ marginRight: '8px' }}/> Submit Grievance</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RaiseComplaint;
