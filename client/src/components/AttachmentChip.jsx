import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { SERVER_ORIGIN } from '../services/api';

const isImage = (mimeType) => mimeType && mimeType.startsWith('image/');

/**
 * Renders a single attachment — an inline thumbnail for images, or a
 * small file chip (with a PDF icon) for anything else. Always links out
 * to the full file in a new tab.
 */
const AttachmentChip = ({ attachment, size = 64 }) => {
    if (!attachment) return null;
    const fullUrl = `${SERVER_ORIGIN}${attachment.url}`;

    if (isImage(attachment.mimeType)) {
        return (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" title={attachment.originalName}>
                <img
                    src={fullUrl}
                    alt={attachment.originalName || 'attachment'}
                    style={{
                        width: size,
                        height: size,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                    }}
                />
            </a>
        );
    }

    return (
        <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={attachment.originalName}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--neutral-bg)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                textDecoration: 'none',
                maxWidth: '180px'
            }}
        >
            <FaFilePdf style={{ color: 'var(--error)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {attachment.originalName || 'File'}
            </span>
        </a>
    );
};

export default AttachmentChip;
