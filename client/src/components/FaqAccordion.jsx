import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

/**
 * A lightweight accordion built with plain React state rather than
 * Bootstrap's Collapse JS component — keeps this simple and avoids
 * running a second Bootstrap plugin instance alongside the Carousel one.
 */
const FaqAccordion = ({ items }) => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                    <div key={item.q} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <button
                            onClick={() => setOpenIndex(isOpen ? -1 : i)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '1rem',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                padding: '1.25rem 1.5rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: 'var(--text-main)',
                                fontFamily: 'inherit'
                            }}
                            aria-expanded={isOpen}
                        >
                            <span>{item.q}</span>
                            <FaChevronDown
                                style={{
                                    flexShrink: 0,
                                    color: 'var(--primary)',
                                    transition: 'transform 0.25s ease',
                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}
                            />
                        </button>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateRows: isOpen ? '1fr' : '0fr',
                                transition: 'grid-template-rows 0.3s ease'
                            }}
                        >
                            <div style={{ overflow: 'hidden' }}>
                                <p style={{ padding: '0 1.5rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default FaqAccordion;
