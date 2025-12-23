import { HiExternalLink, HiCode, HiHeart, HiMail, HiArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="about-page">
            <nav className="about-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <span className="logo-icon">🔒</span>
                        <span className="logo-text">PromoSecure</span>
                    </Link>
                    <Link to="/" className="btn btn-ghost">
                        <HiArrowLeft /> Back to Home
                    </Link>
                </div>
            </nav>

            <div className="about-container">
                <div className="about-header">
                    <span className="about-badge">About</span>
                    <h1>About PromoSecure</h1>
                    <p>Privacy-first promotional verification platform</p>
                </div>

                <div className="about-content">
                    {/* Project Info */}
                    <section className="about-section">
                        <h2>🔒 The Project</h2>
                        <p>
                            PromoSecure is a comprehensive SaaS platform designed for field marketing and promotional
                            verification. It enables companies to verify promotional activities while protecting
                            public privacy through AI-powered face blurring technology.
                        </p>
                        <div className="feature-list">
                            <div className="feature-item">
                                <span className="feature-icon">📸</span>
                                <div>
                                    <strong>Smart Photo Capture</strong>
                                    <p>In-app camera with real-time face detection</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🤖</span>
                                <div>
                                    <strong>AI Face Blurring</strong>
                                    <p>4-layer privacy protection automatically blurs all faces</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✅</span>
                                <div>
                                    <strong>Duplicate Detection</strong>
                                    <p>Prevents fraud with image hashing and face signatures</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <div>
                                    <strong>Analytics Dashboard</strong>
                                    <p>Real-time insights and team performance metrics</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Developer Info */}
                    <section className="about-section developer-section">
                        <h2>👨‍💻 About the Developer</h2>
                        <div className="developer-card">
                            <div className="developer-avatar">
                                V
                            </div>
                            <div className="developer-info">
                                <h3>Vignesh</h3>
                                <p className="developer-role">Full Stack Developer</p>
                                <p className="developer-bio">
                                    Passionate about building privacy-first applications and AI-powered solutions.
                                    PromoSecure is built with modern technologies including React, Node.js,
                                    MongoDB, and TensorFlow.js for on-device AI processing.
                                </p>
                                <div className="developer-links">
                                    <a href="https://github.com/Vixcy300" target="_blank" rel="noopener noreferrer" className="developer-link github">
                                        <HiCode /> GitHub
                                        <HiExternalLink className="external-icon" />
                                    </a>
                                    <a href="mailto:vigneshigt@gmail.com" className="developer-link email">
                                        <HiMail /> vigneshigt@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tech Stack */}
                    <section className="about-section">
                        <h2>🛠️ Tech Stack</h2>
                        <div className="tech-grid">
                            <div className="tech-item">
                                <span className="tech-icon">⚛️</span>
                                <span>React</span>
                            </div>
                            <div className="tech-item">
                                <span className="tech-icon">📦</span>
                                <span>Node.js</span>
                            </div>
                            <div className="tech-item">
                                <span className="tech-icon">🍃</span>
                                <span>MongoDB</span>
                            </div>
                            <div className="tech-item">
                                <span className="tech-icon">🧠</span>
                                <span>TensorFlow.js</span>
                            </div>
                            <div className="tech-item">
                                <span className="tech-icon">📄</span>
                                <span>PDFKit</span>
                            </div>
                            <div className="tech-item">
                                <span className="tech-icon">📧</span>
                                <span>Nodemailer</span>
                            </div>
                            <div className="tech-item">
                                <span className="tech-icon">🗺️</span>
                                <span>Leaflet</span>
                            </div>
                            <div className="tech-item">
                                <span className="tech-icon">📊</span>
                                <span>Chart.js</span>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="about-footer">
                        <p>Made with <HiHeart className="heart-icon" /> by Vignesh</p>
                        <p className="copyright">© 2024 PromoSecure. All rights reserved.</p>
                    </div>
                </div>
            </div>

            <style>{`
                .about-page {
                    min-height: 100vh;
                    background: var(--bg-primary);
                }

                .about-nav {
                    background: white;
                    border-bottom: 1px solid var(--border-color);
                    padding: 1rem 0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .about-nav .nav-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .logo-icon { font-size: 1.5rem; }
                .logo-text { background: var(--brand-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

                .about-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 3rem 2rem;
                }

                .about-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .about-badge {
                    display: inline-block;
                    padding: 0.375rem 1rem;
                    background: var(--primary-50);
                    color: var(--primary-600);
                    font-size: 0.8rem;
                    font-weight: 600;
                    border-radius: var(--radius-full);
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }

                .about-header h1 {
                    font-size: 2.5rem;
                    background: var(--brand-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0.5rem;
                }

                .about-header p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .about-section {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                }

                .about-section h2 {
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                }

                .about-section > p {
                    color: var(--text-secondary);
                    line-height: 1.7;
                }

                .feature-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .feature-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-lg);
                }

                .feature-icon {
                    font-size: 1.5rem;
                }

                .feature-item strong {
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .feature-item p {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin: 0;
                }

                .developer-card {
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-start;
                }

                .developer-avatar {
                    width: 80px;
                    height: 80px;
                    background: var(--brand-gradient);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .developer-info h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.25rem;
                }

                .developer-role {
                    color: var(--brand-primary);
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                }

                .developer-bio {
                    color: var(--text-secondary);
                    line-height: 1.6;
                    margin-bottom: 1rem;
                }

                .developer-links {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .developer-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-lg);
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all var(--transition-fast);
                }

                .developer-link.github {
                    background: #24292e;
                    color: white;
                }

                .developer-link.github:hover {
                    background: #1a1e22;
                }

                .developer-link.email {
                    background: var(--primary-50);
                    color: var(--primary-600);
                }

                .developer-link.email:hover {
                    background: var(--primary-100);
                }

                .external-icon {
                    font-size: 0.75rem;
                    opacity: 0.7;
                }

                .tech-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }

                .tech-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-lg);
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .tech-icon {
                    font-size: 1.5rem;
                }

                .about-footer {
                    text-align: center;
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border-color);
                }

                .about-footer p {
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .heart-icon {
                    color: #ef4444;
                }

                .copyright {
                    font-size: 0.85rem;
                    margin-top: 0.5rem;
                }

                @media (max-width: 768px) {
                    .feature-list, .tech-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .developer-card {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }

                    .developer-links {
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .tech-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

export default About;
