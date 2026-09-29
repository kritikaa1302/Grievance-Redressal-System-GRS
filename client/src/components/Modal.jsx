import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * A simple, self-contained modal — plain React state, no Bootstrap JS
 * dependency (keeps things simple and avoids any conflict with the
 * Carousel's Bootstrap module instance).
 *
 * Note: the background page is intentionally left scrollable while this
 * is open (no body-scroll lock) — the modal is `position: fixed`, so it
 * stays pinned in place regardless of background scroll, letting you
 * scroll the dashboard behind it to cross-reference something while
 * reading the modal.
 *
 * Layout uses a flex column (header: flexShrink 0, body: flex 1 +
 * overflowY auto + minHeight 0) so the modal's own content always
 * scrolls reliably regardless of where the cursor is, even with nested
 * scrollable regions (like the activity timeline or conversation
 * thread) inside it.
 */
const Modal = ({ open, onClose, title, children, maxWidth = '600px' }) => {
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="card animate-fade"
                style={{
                    width: '100%',
                    maxWidth,
                    maxHeight: '85vh',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden' // the outer card never scrolls itself
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                    background: 'var(--card-bg)'
                }}>
                    <h5 style={{ margin: 0 }}>{title}</h5>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            fontSize: '1.1rem',
                            padding: '0.25rem'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* This is the ONLY scrollable region — flex:1 + minHeight:0
                    is what makes overflow actually work inside a flex column
                    (without minHeight:0, flex items refuse to shrink below
                    their content size, and overflow silently does nothing). */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1,
                    minHeight: 0
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;