import React, { useEffect, useRef, useId } from 'react';
import { Carousel } from 'bootstrap';

/**
 * A thin wrapper around Bootstrap's Carousel JS component.
 *
 * We initialize it manually via the JS API (rather than relying on
 * `data-bs-ride="carousel"` auto-init) because Bootstrap's auto-init only
 * runs once, on the window `load` event. Since this app is a client-rendered
 * SPA with lazy-loaded routes, the carousel markup often doesn't exist yet
 * when `load` fires, so auto-init would silently do nothing.
 *
 * We also import `Carousel` directly from the `bootstrap` package instead of
 * reaching for `window.bootstrap` — depending on how Vite pre-bundles the
 * UMD build, the global may or may not actually get attached, so a direct
 * import is the reliable option.
 *
 * Props:
 *  - slides: array of { key, render() } — anything renderable per slide
 *  - interval: autoplay delay in ms (default 4500)
 */
const BsCarousel = ({ slides, interval = 4500, className = '' }) => {
    const rawId = useId().replace(/:/g, '');
    const id = `carousel-${rawId}`;
    const ref = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        instanceRef.current = new Carousel(el, {
            interval,
            ride: 'carousel',
            wrap: true,
            pause: 'hover',
            touch: true,
        });

        return () => {
            instanceRef.current?.dispose();
            instanceRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div id={id} className={`carousel slide ${className}`} ref={ref}>
            <div className="carousel-indicators">
                {slides.map((s, i) => (
                    <button
                        key={s.key}
                        type="button"
                        data-bs-target={`#${id}`}
                        data-bs-slide-to={i}
                        className={i === 0 ? 'active' : ''}
                        aria-current={i === 0 ? 'true' : undefined}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>

            <div className="carousel-inner">
                {slides.map((s, i) => (
                    <div className={`carousel-item ${i === 0 ? 'active' : ''}`} key={s.key}>
                        {s.render()}
                    </div>
                ))}
            </div>

            <button className="carousel-control-prev" type="button" data-bs-target={`#${id}`} data-bs-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target={`#${id}`} data-bs-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
};

export default BsCarousel;
