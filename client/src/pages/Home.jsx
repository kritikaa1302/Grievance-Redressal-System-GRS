import React from 'react'
import { Link } from 'react-router-dom'
import {
    FaUserShield, FaGraduationCap, FaUserPlus, FaArrowRight, FaBullhorn, FaChartLine,
    FaCheckCircle, FaShieldAlt, FaClipboardList, FaSearchengin, FaThumbsUp,
    FaClock, FaLock, FaMobileAlt, FaBell,
    FaBook, FaHome, FaTools, FaExclamationTriangle, FaMoneyBillWave, FaEllipsisH
} from "react-icons/fa";
import logo from '../assets/image.png';
import BsCarousel from '../components/BsCarousel';
import Reveal from '../components/Reveal';
import FaqAccordion from '../components/FaqAccordion';

const portalCards = [
    {
        to: '/admin/login',
        icon: <FaUserShield className="display-4" />,
        title: 'Admin Login',
        text: 'Manage complaints, colleges, sessions and categories.',
        color: 'var(--admin)'
    },
    {
        to: '/login',
        icon: <FaGraduationCap className="display-4" />,
        title: 'Student Login',
        text: 'Track your grievances and their resolution status.',
        color: 'var(--primary)'
    },
    {
        to: '/register',
        icon: <FaUserPlus className="display-4" />,
        title: 'Register',
        text: 'New student? Create an account to get started.',
        color: 'var(--accent)'
    }
];

// Real campus photos via Unsplash (Unsplash License: free for commercial
// use, no attribution required). Verified working image IDs:
//  - Nathan Dumlao: lecture hall
//  - Priscilla Du Preez: library
//  - Michael Marsh: campus building
//  - Emily Karakis: university building
const heroSlides = [
    {
        key: 'voice',
        image: 'https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=1600&q=75',
        tint: 'rgba(79, 70, 229, 0.45)',
        icon: <FaBullhorn />,
        title: 'Voice Your Concerns',
        text: 'Raise any campus grievance in minutes, from anywhere, on any device.'
    },
    {
        key: 'track',
        image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=75',
        tint: 'rgba(5, 150, 105, 0.45)',
        icon: <FaChartLine />,
        title: 'Track in Real Time',
        text: 'Follow the status of every complaint you\u2019ve raised, right from your dashboard.'
    },
    {
        key: 'resolve',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=75',
        tint: 'rgba(217, 119, 6, 0.45)',
        icon: <FaCheckCircle />,
        title: 'Quick Resolution',
        text: 'Administrators review and act on grievances promptly, so issues don\u2019t linger.'
    },
    {
        key: 'secure',
        image: 'https://images.unsplash.com/photo-1559135197-8a45ea74d367?auto=format&fit=crop&w=1600&q=75',
        tint: 'rgba(220, 38, 38, 0.45)',
        icon: <FaShieldAlt />,
        title: 'Secure & Confidential',
        text: 'Your submissions are protected and only visible to authorized staff.'
    }
];

const highlights = [
    { icon: <FaClock size={22} />, title: '24/7 Availability', text: 'Raise a grievance any time, no office hours needed.' },
    { icon: <FaLock size={22} />, title: 'Fully Confidential', text: 'Only authorized staff can view your submission.' },
    { icon: <FaMobileAlt size={22} />, title: 'Works Anywhere', text: 'Fully responsive — use it on your phone or laptop.' },
    { icon: <FaBell size={22} />, title: 'Status Updates', text: 'Know exactly where your complaint stands, always.' }
];

const categories = [
    { icon: <FaBook />, label: 'Academic' },
    { icon: <FaHome />, label: 'Hostel & Mess' },
    { icon: <FaTools />, label: 'Infrastructure' },
    { icon: <FaExclamationTriangle />, label: 'Ragging & Harassment' },
    { icon: <FaMoneyBillWave />, label: 'Fees & Admin' },
    { icon: <FaEllipsisH />, label: 'Other' }
];

const faqs = [
    {
        q: 'Who can raise a grievance on this system?',
        a: 'Any registered student can raise a grievance after creating an account and logging in. Admins manage and resolve grievances from their own dashboard.'
    },
    {
        q: 'Can I track the status of my complaint?',
        a: 'Yes — once submitted, your complaint shows up on your student dashboard with its current status (Not Processed, Pending, or Closed), updated as the admin reviews it.'
    },
    {
        q: 'Is my grievance visible to other students?',
        a: 'No. Grievances are only visible to you and the administrators responsible for reviewing and resolving them.'
    },
    {
        q: 'What kind of issues can I report?',
        a: 'Anything from academic and hostel concerns to infrastructure issues or harassment — pick the closest matching category when you submit, or choose "Other" if none quite fit.'
    }
];
const steps = [
    {
        key: 'step1',
        icon: <FaUserPlus size={28} />,
        title: '1. Create an Account',
        text: 'Register with your college and course details in under two minutes.',
        color: 'var(--primary)'
    },
    {
        key: 'step2',
        icon: <FaClipboardList size={28} />,
        title: '2. Raise a Grievance',
        text: 'Pick a category, describe the issue, and submit your complaint.',
        color: 'var(--accent)'
    },
    {
        key: 'step3',
        icon: <FaSearchengin size={28} />,
        title: '3. Admin Review',
        text: 'The concerned admin reviews your complaint and updates its status.',
        color: 'var(--admin)'
    },
    {
        key: 'step4',
        icon: <FaThumbsUp size={28} />,
        title: '4. Get Resolved',
        text: 'Track progress on your dashboard until the issue is marked closed.',
        color: 'var(--success)'
    }
];

const Home = () => {
    return (
        <div className="container-fluid animate-fade">
            <div className="row">
                <div className="col-sm-8 mx-auto text-center" style={{ paddingTop: '1rem' }}>
                    <img src={logo} alt="GRS logo" style={{ width: '90px', height: '90px', marginBottom: '1rem' }} />
                    <h2 className='my-2' style={{ fontSize: '2.25rem' }}>Grievance Redressal System</h2>
                    <p className='my-2 fs-5 fst-italic' style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto' }}>
                        "Welcome to the Grievance Redressal System. This system is designed to help you voice your concerns and get them resolved in a timely and efficient manner."
                    </p>
                </div>
            </div>

            <div className="row my-5">
                {portalCards.map((p) => (
                    <div className="col-sm-4 mb-4 mb-sm-0" key={p.title}>
                        <Link to={p.to} className="text-decoration-none">
                            <div className="card h-100" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                                <div style={{ color: p.color, marginBottom: '1rem' }}>
                                    {p.icon}
                                </div>
                                <h5 style={{ color: p.color, marginBottom: '0.5rem' }}>{p.title}</h5>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{p.text}</p>
                                <span style={{ color: p.color, fontWeight: 600, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    Continue <FaArrowRight size={12} />
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Hero Carousel */}
            <Reveal>
                <div className="container" style={{ padding: 0 }}>
                    <BsCarousel
                        className="hero-carousel"
                        interval={4500}
                        slides={heroSlides.map((s) => ({
                            key: s.key,
                            render: () => (
                                <div
                                    className="hero-slide"
                                    style={{
                                        backgroundImage: `linear-gradient(${s.tint}, ${s.tint}), url(${s.image})`
                                    }}
                                >
                                    <div>
                                        <div className="hero-slide-icon">{s.icon}</div>
                                        <h3>{s.title}</h3>
                                        <p>{s.text}</p>
                                    </div>
                                </div>
                            )
                        }))}
                    />
                </div>
            </Reveal>

            {/* Feature Highlights */}
            <Reveal delay={100}>
                <div className="row my-5">
                    {highlights.map((h) => (
                        <div className="col-sm-6 col-md-3 mb-4 mb-md-0" key={h.title}>
                            <div className="card h-100" style={{ textAlign: 'center', padding: '1.75rem 1.25rem' }}>
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '50%',
                                    background: 'var(--neutral-bg)', color: 'var(--primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1rem'
                                }}>
                                    {h.icon}
                                </div>
                                <h6 style={{ marginBottom: '0.4rem' }}>{h.title}</h6>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{h.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Reveal>

            {/* How It Works Carousel */}
            <Reveal>
                <div className="row my-5">
                    <div className="col-sm-10 mx-auto">
                        <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>How It Works</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            From raising a concern to seeing it resolved, in four simple steps.
                        </p>
                        <BsCarousel
                            className="step-carousel"
                            interval={5000}
                            slides={steps.map((s) => ({
                                key: s.key,
                                render: () => (
                                    <div className="card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '2.5rem 2rem' }}>
                                        <div style={{
                                            width: '64px', height: '64px', borderRadius: '50%',
                                            background: s.color, color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 1.25rem'
                                        }}>
                                            {s.icon}
                                        </div>
                                        <h5 style={{ marginBottom: '0.5rem' }}>{s.title}</h5>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.text}</p>
                                    </div>
                                )
                            }))}
                        />
                    </div>
                </div>
            </Reveal>

            {/* Grievance Categories showcase */}
            <Reveal>
                <div className="row my-5">
                    <div className="col-sm-10 mx-auto text-center">
                        <h3 style={{ marginBottom: '0.5rem' }}>What You Can Report</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            A few common categories students raise grievances about — your college's actual list may vary.
                        </p>
                        <div className="grid grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                            {categories.map((c) => (
                                <div
                                    key={c.label}
                                    className="card"
                                    style={{
                                        padding: '1.5rem 1rem',
                                        textAlign: 'center',
                                        cursor: 'default'
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.6rem' }}>
                                        {c.icon}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{c.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Reveal>

            {/* FAQ */}
            <Reveal>
                <div className="row my-5">
                    <div className="col-sm-8 mx-auto">
                        <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Frequently Asked Questions</h3>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Quick answers before you get started.
                        </p>
                        <FaqAccordion items={faqs} />
                    </div>
                </div>
            </Reveal>

            {/* footer */}
            <div className="row">
                <div className="col-sm-12" style={{ background: 'var(--primary)', borderRadius: 'var(--radius)' }}>
                    <footer className="text-center">
                        <div className="text-center p-3 text-white fs-6 fw-bold">
                            © {new Date().getFullYear()} Grievance Redressal System. Designed and Developed By Softpro India Computer Technology Pvt. Ltd.
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}

export default Home
