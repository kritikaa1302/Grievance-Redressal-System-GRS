import React, { useEffect, useRef, useState } from 'react';

/**
 * Wraps children and fades/slides them into view the first time they
 * scroll into the viewport (via IntersectionObserver). Purely additive —
 * if IntersectionObserver isn't available for some reason, content is
 * just shown immediately.
 */
const Reveal = ({ children, delay = 0, className = '' }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (!('IntersectionObserver' in window)) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default Reveal;
