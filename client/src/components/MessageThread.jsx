import React, { useState, useRef, useId } from 'react';
import { FaPaperPlane, FaPaperclip, FaTimes } from 'react-icons/fa';
import AttachmentChip from './AttachmentChip';

/**
 * The two-way conversation thread on a complaint — shared between the
 * student and admin dashboards so both sides render/behave identically.
 *
 * Props:
 *  - messages: array of { _id, sender ('student'|'admin'), senderName, text, attachment, createdAt }
 *  - currentRole: 'student' | 'admin' — whose dashboard this is rendering in,
 *    used to align "my" messages differently from "their" messages
 *  - onSend(text, file): async function to send a new message
 *  - sending: boolean, disables the form while a send is in flight
 */
const MessageThread = ({ messages = [], currentRole, onSend, sending }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const fileInputId = `message-file-${useId().replace(/:/g, '')}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !file) return;
        await onSend(text.trim(), file);
        setText('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const sorted = [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return (
        <div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                maxHeight: '280px',
                overflowY: 'auto',
                paddingRight: '4px',
                marginBottom: '1rem'
            }}>
                {sorted.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        No messages yet — {currentRole === 'student' ? 'ask a question or add more details below.' : 'reach out to the student below if you need more information.'}
                    </p>
                ) : (
                    sorted.map((m) => {
                        const isMine = m.sender === currentRole;
                        return (
                            <div
                                key={m._id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMine ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    maxWidth: '85%',
                                    background: isMine ? 'var(--primary)' : 'var(--neutral-bg)',
                                    color: isMine ? 'white' : 'var(--text-main)',
                                    borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                    padding: '0.6rem 0.85rem'
                                }}>
                                    {m.text && (
                                        <div style={{ fontSize: '0.875rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                            {m.text}
                                        </div>
                                    )}
                                    {m.attachment && (
                                        <div style={{ marginTop: m.text ? '0.5rem' : 0 }}>
                                            <AttachmentChip attachment={m.attachment} size={120} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {m.sender === 'admin' ? (m.senderName || 'Admin') : (isMine ? 'You' : (m.senderName || 'Student'))} • {new Date(m.createdAt).toLocaleString()}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {file && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.8rem', color: 'var(--text-muted)',
                        background: 'var(--neutral-bg)', padding: '0.4rem 0.6rem', borderRadius: '8px', width: 'fit-content'
                    }}>
                        <FaPaperclip size={11} /> {file.name}
                        <button
                            type="button"
                            onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                        >
                            <FaTimes size={11} />
                        </button>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
                    <textarea
                        className="form-control"
                        rows={2}
                        placeholder={currentRole === 'student' ? 'Ask a question or add more detail...' : 'Reply to the student...'}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ resize: 'vertical', flex: 1 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*,.pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            style={{ display: 'none' }}
                            id={fileInputId}
                        />
                        <label
                            htmlFor={fileInputId}
                            className="theme-toggle"
                            title="Attach a file"
                            style={{ margin: 0 }}
                        >
                            <FaPaperclip size={14} />
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={sending || (!text.trim() && !file)}
                        style={{ height: '44px', flexShrink: 0 }}
                    >
                        {sending ? '...' : <FaPaperPlane />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageThread;
