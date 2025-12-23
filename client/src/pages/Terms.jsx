import { Link } from 'react-router-dom';
import { HiArrowLeft, HiDocumentText } from 'react-icons/hi';

const Terms = () => {
    return (
        <div className="terms-page">
            <nav className="terms-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <span className="logo-icon">🔒</span>
                        <span className="logo-text">PromoSecure</span>
                    </Link>
                    <Link to="/" className="btn btn-ghost">
                        <HiArrowLeft /> Back
                    </Link>
                </div>
            </nav>

            <div className="terms-container">
                <div className="terms-header">
                    <HiDocumentText className="terms-icon" />
                    <h1>Terms of Service</h1>
                    <p className="last-updated">Last Updated: December 23, 2024</p>
                </div>

                <div className="terms-content">
                    <section className="terms-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using PromoSecure ("the Service"), you agree to be bound by these
                            Terms of Service. If you do not agree to these terms, please do not use our Service.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>2. Description of Service</h2>
                        <p>
                            PromoSecure is a privacy-first promotional verification platform that enables
                            organizations to verify promotional activities through photo documentation while
                            protecting public privacy through AI-powered face blurring technology.
                        </p>
                        <p>The Service includes:</p>
                        <ul>
                            <li>Photo capture and submission capabilities</li>
                            <li>AI-powered automatic face blurring</li>
                            <li>Duplicate detection and verification</li>
                            <li>GPS location tracking for verification</li>
                            <li>Reporting and analytics tools</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>3. User Accounts</h2>
                        <p>
                            To use certain features of the Service, you must create an account. You are responsible
                            for maintaining the confidentiality of your account credentials and for all activities
                            that occur under your account.
                        </p>
                        <p>You agree to:</p>
                        <ul>
                            <li>Provide accurate and complete information when creating an account</li>
                            <li>Update your information to keep it current</li>
                            <li>Notify us immediately of any unauthorized access to your account</li>
                            <li>Not share your login credentials with others</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>4. Acceptable Use</h2>
                        <p>You agree NOT to:</p>
                        <ul>
                            <li>Use the Service for any illegal or unauthorized purpose</li>
                            <li>Upload content that violates any laws or regulations</li>
                            <li>Attempt to circumvent the face blurring or privacy protection features</li>
                            <li>Upload photos without appropriate consent where required by law</li>
                            <li>Attempt to access data belonging to other users</li>
                            <li>Use automated scripts or bots to access the Service</li>
                            <li>Submit fraudulent or misleading promotional verification</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>5. Privacy & Data Handling</h2>
                        <p>
                            Your privacy is our top priority. Please refer to our <Link to="/privacy">Privacy Policy</Link> for
                            detailed information about how we collect, use, and protect your data.
                        </p>
                        <p>Key points:</p>
                        <ul>
                            <li>All faces in photos are automatically blurred using AI before storage</li>
                            <li>Original unblurred photos never leave the capturing device</li>
                            <li>Photo data is automatically deleted after 30 days</li>
                            <li>We never share your data with third parties for marketing purposes</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>6. Subscription & Payment</h2>
                        <p>
                            PromoSecure offers various subscription tiers with different features and limits.
                            By subscribing to a paid plan, you agree to pay the applicable fees as described
                            at the time of purchase.
                        </p>
                        <ul>
                            <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                            <li>You may cancel your subscription at any time</li>
                            <li>Refunds are handled on a case-by-case basis</li>
                            <li>Free tier usage is subject to rate limits and usage quotas</li>
                        </ul>
                    </section>

                    <section className="terms-section">
                        <h2>7. Intellectual Property</h2>
                        <p>
                            The Service and its original content, features, and functionality are owned by
                            PromoSecure and are protected by international copyright, trademark, and other
                            intellectual property laws.
                        </p>
                        <p>
                            You retain ownership of any photos you upload, but grant us a limited license to
                            process, store, and display them as necessary to provide the Service.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>8. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, PromoSecure shall not be liable for any
                            indirect, incidental, special, consequential, or punitive damages resulting from
                            your use of or inability to use the Service.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>9. Service Modifications</h2>
                        <p>
                            We reserve the right to modify, suspend, or discontinue the Service at any time,
                            with or without notice. We may also update these Terms from time to time. Continued
                            use of the Service after changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>10. Termination</h2>
                        <p>
                            We may terminate or suspend your account and access to the Service immediately,
                            without prior notice, for conduct that we believe violates these Terms or is
                            harmful to other users, us, or third parties.
                        </p>
                    </section>

                    <section className="terms-section">
                        <h2>11. Contact Information</h2>
                        <p>
                            For questions about these Terms of Service, please contact us at:
                        </p>
                        <p className="contact-email">
                            📧 <a href="mailto:vigneshigt@gmail.com">vigneshigt@gmail.com</a>
                        </p>
                    </section>
                </div>

                <div className="terms-footer">
                    <p>
                        By using PromoSecure, you acknowledge that you have read, understood, and agree to
                        be bound by these Terms of Service.
                    </p>
                    <div className="footer-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/help">Help & FAQ</Link>
                    </div>
                </div>
            </div>

            <style>{`
                .terms-page {
                    min-height: 100vh;
                    background: var(--bg-primary);
                }

                .terms-nav {
                    background: white;
                    border-bottom: 1px solid var(--border-color);
                    padding: 1rem 0;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .terms-nav .nav-container {
                    max-width: 800px;
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
                .logo-text { 
                    background: var(--brand-gradient); 
                    -webkit-background-clip: text; 
                    -webkit-text-fill-color: transparent; 
                }

                .terms-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 3rem 2rem;
                }

                .terms-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .terms-icon {
                    font-size: 3rem;
                    color: var(--brand-primary);
                    margin-bottom: 1rem;
                }

                .terms-header h1 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }

                .last-updated {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .terms-content {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-xl);
                    padding: 2rem;
                }

                .terms-section {
                    margin-bottom: 2rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .terms-section:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }

                .terms-section h2 {
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }

                .terms-section p {
                    color: var(--text-secondary);
                    line-height: 1.7;
                    margin-bottom: 1rem;
                }

                .terms-section ul {
                    margin: 0;
                    padding-left: 1.5rem;
                }

                .terms-section li {
                    color: var(--text-secondary);
                    line-height: 1.7;
                    margin-bottom: 0.5rem;
                }

                .terms-section a {
                    color: var(--brand-primary);
                    font-weight: 500;
                }

                .contact-email {
                    font-size: 1.1rem;
                }

                .terms-footer {
                    text-align: center;
                    margin-top: 3rem;
                    padding: 2rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-xl);
                }

                .terms-footer p {
                    color: var(--text-muted);
                    margin-bottom: 1.5rem;
                }

                .footer-links {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                }

                .footer-links a {
                    color: var(--brand-primary);
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .terms-container {
                        padding: 2rem 1rem;
                    }

                    .terms-content {
                        padding: 1.5rem;
                    }

                    .footer-links {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Terms;
