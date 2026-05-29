import { Link } from 'react-router-dom';
import {
    HiSun,
    HiMoon,
    HiArrowUp,
    HiMail,
    HiHeart,
    HiShieldCheck
} from 'react-icons/hi';
import {
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaGithub,
    FaYoutube,
    FaWhatsapp
} from 'react-icons/fa';

function handleScrollTop() {
    window.scroll({ top: 0, behavior: 'smooth' });
}

const navigation = {
    sections: [
        {
            id: 'product',
            name: 'Product',
            items: [
                { name: 'Features', href: '/#features' },
                { name: 'How It Works', href: '/#how-it-works' },
                { name: 'Pricing', href: '/plans' },
            ],
        },
        {
            id: 'platform',
            name: 'Platform',
            items: [
                { name: 'AI Face Blurring', href: '/blog' },
                { name: 'Offline Sync', href: '/blog' },
                { name: 'Analytics', href: '/blog' },
            ],
        },
        {
            id: 'resources',
            name: 'Resources',
            items: [
                { name: 'Blog', href: '/blog' },
                { name: 'Help Center', href: '/help' },
                { name: 'About Us', href: '/about' },
            ],
        },
        {
            id: 'company',
            name: 'Company',
            items: [
                { name: 'Contact', href: 'mailto:vigneshigt@gmail.com' },
                { name: 'Terms', href: '/terms' },
                { name: 'Privacy', href: '/privacy' },
            ],
        },
    ],
};

const socialLinks = [
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaLinkedinIn, href: '#', label: 'LinkedIn' },
    { icon: FaGithub, href: 'https://github.com/Vixcy300/PromoSecure-SaaS', label: 'GitHub' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
    { icon: FaWhatsapp, href: '#', label: 'WhatsApp' },
    { icon: HiMail, href: 'mailto:vigneshigt@gmail.com', label: 'Email' },
];

const Footer = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

    const toggleTheme = (mode) => {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('theme', mode);
    };

    return (
        <footer className="ps-footer">
            {/* Brand + Description */}
            <div className="ps-footer-top">
                <Link to="/" className="ps-footer-logo-link">
                    <div className="ps-footer-logo-mark">
                        <HiShieldCheck />
                    </div>
                </Link>
                <p className="ps-footer-desc">
                    PromoSecure is a privacy-first SaaS platform for promotional verification. We combine 
                    AI-powered face blurring, zero-knowledge geofencing, and cryptographic watermarking to 
                    deliver enterprise-grade campaign verification. Our mission is to empower field marketing 
                    agencies with tools that guarantee authenticity while protecting every individual's privacy. 
                    Built with security at its core, PromoSecure processes everything on-device — your data 
                    never leaves your control.
                </p>
            </div>

            {/* Dotted Border Divider */}
            <div className="ps-footer-inner">
                <div className="ps-footer-divider" />

                {/* Navigation Grid */}
                <div className="ps-footer-nav">
                    {navigation.sections.map((section) => (
                        <div key={section.id} className="ps-footer-nav-col">
                            {section.items.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="ps-footer-link"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="ps-footer-divider" />
            </div>

            {/* Social Icons + Theme Toggle */}
            <div className="ps-footer-social-row">
                <div className="ps-footer-socials">
                    {socialLinks.map(({ icon: Icon, href, label }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="ps-social-btn"
                            aria-label={label}
                        >
                            <Icon />
                        </a>
                    ))}
                </div>

                {/* Theme Toggle Pill */}
                <div className="ps-theme-pill">
                    <button
                        onClick={() => toggleTheme('light')}
                        className="ps-theme-btn ps-theme-light"
                        aria-label="Light mode"
                    >
                        <HiSun />
                    </button>

                    <button
                        onClick={handleScrollTop}
                        className="ps-theme-btn ps-scroll-top"
                        aria-label="Scroll to top"
                    >
                        <HiArrowUp />
                    </button>

                    <button
                        onClick={() => toggleTheme('dark')}
                        className="ps-theme-btn ps-theme-dark"
                        aria-label="Dark mode"
                    >
                        <HiMoon />
                    </button>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="ps-footer-copyright">
                <span>©</span>
                <span>{new Date().getFullYear()}</span>
                <span>Made with</span>
                <HiHeart className="ps-heart" />
                <span>by</span>
                <a
                    href="https://github.com/Vixcy300"
                    target="_blank"
                    rel="noreferrer"
                    className="ps-author"
                >
                    Vignesh
                </a>
                <span>—</span>
                <Link to="/" className="ps-brand-link">PromoSecure</Link>
            </div>

            <style>{`
                .ps-footer {
                    border-top: 1px solid var(--border-color, #e0e0e0);
                    padding: 0 1rem;
                    background: var(--bg-primary, #fff);
                }

                .ps-footer-top {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    padding: 2.5rem 1rem 0;
                }

                .ps-footer-logo-link {
                    flex-shrink: 0;
                }

                .ps-footer-logo-mark {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: var(--brand-primary, #0066CC);
                }

                .ps-footer-desc {
                    font-size: 0.75rem;
                    line-height: 1.5;
                    color: var(--text-muted, #9e9e9e);
                    margin: 0;
                    text-align: left;
                    max-width: 900px;
                }

                .ps-footer-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }

                .ps-footer-divider {
                    border-bottom: 1px dotted var(--border-color, #e0e0e0);
                    margin: 2rem 0;
                }

                .ps-footer-nav {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                }

                .ps-footer-nav-col {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .ps-footer-link {
                    font-size: 0.8rem;
                    color: var(--text-secondary, #616161);
                    text-decoration: none;
                    transition: color 0.2s, transform 0.2s;
                    display: block;
                }
                .ps-footer-link:hover {
                    color: var(--text-primary, #212121);
                    transform: translateX(2px);
                }

                /* Social Row */
                .ps-footer-social-row {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1rem 1rem 0;
                }

                .ps-footer-socials {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 0.75rem;
                }

                .ps-social-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: 1px dotted var(--border-color, #e0e0e0);
                    border-radius: 12px;
                    color: var(--text-secondary, #616161);
                    font-size: 1.1rem;
                    transition: transform 0.2s, color 0.2s, border-color 0.2s;
                    text-decoration: none;
                }
                .ps-social-btn:hover {
                    transform: translateY(-2px);
                    color: var(--text-primary, #212121);
                    border-color: var(--text-primary, #212121);
                }

                /* Theme Toggle Pill */
                .ps-theme-pill {
                    display: flex;
                    align-items: center;
                    border: 1px dotted var(--border-color, #e0e0e0);
                    border-radius: 9999px;
                    padding: 0;
                    overflow: hidden;
                }

                .ps-theme-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.6rem;
                    color: var(--text-secondary, #616161);
                    font-size: 1rem;
                    transition: background 0.2s, color 0.2s;
                }
                .ps-theme-btn:hover {
                    color: var(--text-primary, #212121);
                }

                .ps-theme-light {
                    background: var(--bg-tertiary, #f5f5f5);
                    border-radius: 9999px;
                    color: var(--text-primary, #212121);
                    margin-right: 0.25rem;
                }

                .ps-scroll-top {
                    font-size: 0.75rem;
                }

                .ps-theme-dark {
                    margin-left: 0.25rem;
                }

                /* Copyright */
                .ps-footer-copyright {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 2.5rem 1rem;
                    font-size: 0.8rem;
                    color: var(--text-muted, #9e9e9e);
                }

                .ps-heart {
                    color: #ef4444;
                    font-size: 1rem;
                    animation: heartbeat 1.5s ease-in-out infinite;
                }

                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }

                .ps-author {
                    color: var(--text-primary, #212121);
                    font-weight: 700;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .ps-author:hover {
                    color: var(--brand-primary, #0066CC);
                }

                .ps-brand-link {
                    color: var(--text-muted, #9e9e9e);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .ps-brand-link:hover {
                    color: var(--brand-primary, #0066CC);
                }

                /* Mobile Responsive */
                @media (max-width: 768px) {
                    .ps-footer-top {
                        flex-direction: column;
                        text-align: center;
                        padding: 2rem 1rem 0;
                    }
                    .ps-footer-desc {
                        text-align: center;
                    }
                    .ps-footer-nav {
                        grid-template-columns: repeat(2, 1fr);
                        text-align: center;
                    }
                    .ps-footer-nav-col {
                        align-items: center;
                    }
                    .ps-footer-link:hover {
                        transform: none;
                    }
                }

                @media (max-width: 480px) {
                    .ps-footer-nav {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1rem;
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
