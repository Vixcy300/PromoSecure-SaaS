import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiCheck, HiSparkles, HiShieldCheck, HiSupport, HiLightningBolt, HiMail, HiUser, HiPhone, HiOfficeBuilding, HiX, HiCreditCard, HiLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';
import PaymentForm from '../components/PaymentForm';
import PromoSecurePricing from '../components/PromoSecurePricing';

const Plans = () => {
    const navigate = useNavigate();
    const demoRef = useRef(null);
    const [showProModal, setShowProModal] = useState(false);
    const [demoForm, setDemoForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [proForm, setProForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const scrollToDemo = () => {
        demoRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDemoSubmit = async (e) => {
        e.preventDefault();
        if (!demoForm.name || !demoForm.email) {
            toast.error('Please fill in required fields');
            return;
        }
        setSubmitting(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        toast.success('Demo request submitted! We\'ll contact you within 24 hours.');
        setDemoForm({ name: '', email: '', phone: '', company: '', message: '' });
        setSubmitting(false);
    };

    const handleProSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSubmitting(true);
        setPaymentError(null);
        // Simulate payment gateway processing attempt
        await new Promise(r => setTimeout(r, 1800));
        setSubmitting(false);
        const errMsg = 'Payment Gateway Error: Payment API is expired. Please contact developers at vigneshigt@gmail.com to activate your subscription.';
        setPaymentError(errMsg);
        toast.error('⚠️ Payment API is expired. Contact devs: vigneshigt@gmail.com', {
            duration: 8000,
            id: 'payment-api-expired'
        });
    };

    const plans = [
        {
            name: 'Trial',
            price: '₹0',
            period: '14 days',
            description: 'Perfect to explore and test all features',
            features: [
                'Full access to all features',
                'Up to 3 Promoters',
                '100 photos included',
                'Pre-populated sample data',
                'Email support',
                'AI face blurring'
            ],
            cta: 'Request Demo Access',
            action: scrollToDemo,
            popular: false,
            discount: null
        },
        {
            name: 'Pro',
            price: '₹1,249',
            originalPrice: '₹2,499',
            period: 'month',
            description: 'Best for growing agencies',
            features: [
                'Unlimited Managers',
                'Unlimited Promoters',
                'Unlimited photos',
                'Advanced analytics',
                'Priority WhatsApp support',
                'API access',
                'Custom branding',
                'Export to Excel/PDF'
            ],
            cta: 'Start Pro Plan',
            action: () => {
                setPaymentError(null);
                setShowProModal(true);
            },
            popular: true,
            discount: '50% OFF'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For large organizations with custom needs',
            features: [
                'Everything in Pro',
                'Custom integrations',
                'Dedicated account manager',
                'SLA guarantee',
                'On-premise deployment',
                'Training & onboarding',
                'White-label option',
                '24/7 phone support'
            ],
            cta: 'Contact Sales',
            action: scrollToDemo,
            popular: false,
            discount: null
        }
    ];

    return (
        <div className="plans-page">
            {/* Back link */}
            <div style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', zIndex: 200 }}>
                <Link to="/" className="back-link" style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', fontSize: '0.9rem' }}>
                    <HiArrowLeft /> Back to Home
                </Link>
            </div>

            {/* ✨ New premium pricing section */}
            <PromoSecurePricing
                onPlanAction={() => { setPaymentError(null); setShowProModal(true); }}
                onScrollToDemo={scrollToDemo}
            />

            {/* Trust Section */}
            <section className="trust-section">
                <div className="trust-container">
                    <h2>Why Choose PromoSecure?</h2>
                    <div className="trust-grid">
                        <div className="trust-item">
                            <HiShieldCheck className="trust-icon" />
                            <h4>Privacy First</h4>
                            <p>4-layer AI face blurring protects public privacy</p>
                        </div>
                        <div className="trust-item">
                            <HiLightningBolt className="trust-icon" />
                            <h4>Lightning Fast</h4>
                            <p>Process photos in under 2 seconds</p>
                        </div>
                        <div className="trust-item">
                            <HiSupport className="trust-icon" />
                            <h4>Dedicated Support</h4>
                            <p>WhatsApp support for Pro users</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Request Section */}
            <section className="demo-section" ref={demoRef} id="demo">
                <div className="demo-container">
                    <div className="demo-content">
                        <div className="demo-info">
                            <h2>🚀 Request a Demo</h2>
                            <p className="demo-subtitle">
                                Want to see PromoSecure in action? We're happy to provide a demo account
                                so you can experience our privacy-first platform firsthand.
                            </p>
                            <ul className="demo-benefits">
                                <li><HiCheck /> Full access to all features</li>
                                <li><HiCheck /> Pre-populated sample data</li>
                                <li><HiCheck /> Explore AI face blurring</li>
                                <li><HiCheck /> Test the mobile experience</li>
                            </ul>
                            <div className="demo-contact">
                                <p><HiMail /> vigneshigt@gmail.com</p>
                            </div>
                        </div>
                        <form className="demo-form" onSubmit={handleDemoSubmit}>
                            <h3>Get Your Demo Access</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><HiUser /> Full Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Your name"
                                        value={demoForm.name}
                                        onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label><HiMail /> Email *</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="you@company.com"
                                        value={demoForm.email}
                                        onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label><HiPhone /> Phone</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        placeholder="+91 98765 43210"
                                        value={demoForm.phone}
                                        onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><HiOfficeBuilding /> Company</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Your company"
                                        value={demoForm.company}
                                        onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Message (Optional)</label>
                                <textarea
                                    className="input"
                                    rows="3"
                                    placeholder="Tell us about your needs..."
                                    value={demoForm.message}
                                    onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg demo-submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : '🎯 Get Your Demo Access'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="plans-faq">
                <div className="faq-container">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h4>Can I switch plans later?</h4>
                            <p>Yes! You can upgrade or downgrade at any time. Changes take effect immediately.</p>
                        </div>
                        <div className="faq-item">
                            <h4>Is there a long-term contract?</h4>
                            <p>No contracts. Pay monthly and cancel anytime with no penalties.</p>
                        </div>
                        <div className="faq-item">
                            <h4>What payment methods do you accept?</h4>
                            <p>We accept all major credit cards, UPI, and bank transfers for Enterprise plans.</p>
                        </div>
                        <div className="faq-item">
                            <h4>How long is the trial period?</h4>
                            <p>The trial is 14 days with full access to all features. No credit card required.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pro Checkout Modal */}
            {showProModal && (
                <div className="modal-overlay" onClick={() => setShowProModal(false)}>
                    <div className="pro-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowProModal(false)}>
                            <HiX />
                        </button>
                        <div className="modal-header">
                            <div className="modal-badge">🔥 50% OFF</div>
                            <h2>Upgrade to Pro</h2>
                            <p>Get unlimited access to all features</p>
                        </div>
                        <div className="modal-price-box">
                            <span className="modal-original">₹2,499</span>
                            <span className="modal-price">₹1,249<span>/month</span></span>
                            <span className="modal-savings">You save ₹1,250/month!</span>
                        </div>

                        {paymentError && (
                            <div className="payment-error-alert" style={{
                                background: '#fef2f2',
                                border: '1px solid #f87171',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '1.25rem',
                                textAlign: 'left'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>⚠️</span> Payment Gateway API Expired
                                </div>
                                <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                                    The payment gateway integration has expired. Please contact our development team at <strong style={{ color: '#991b1b' }}>vigneshigt@gmail.com</strong> to activate your subscription.
                                </p>
                                <a 
                                    href="mailto:vigneshigt@gmail.com?subject=PromoSecure%20Pro%20Plan%20Activation" 
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.82rem',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        background: '#dc2626',
                                        padding: '0.45rem 0.9rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                                    }}
                                >
                                    <HiMail /> Email Developer (vigneshigt@gmail.com)
                                </a>
                            </div>
                        )}

                        <PaymentForm 
                            amount="₹1,249"
                            onSubmit={handleProSubmit}
                            onCancel={() => setShowProModal(false)}
                            submitting={submitting}
                        />
                    </div>
                </div>
            )}

            <style>{`
                .plans-page {
                    min-height: 100vh;
                    background: #000;
                    position: relative;
                }

                .plans-header {
                    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
                    padding: 2rem 2rem 4rem;
                    text-align: center;
                    position: relative;
                }

                .back-link {
                    position: absolute;
                    top: 1.5rem;
                    left: 2rem;
                    color: white;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    opacity: 0.9;
                    transition: opacity 0.2s;
                }

                .back-link:hover {
                    opacity: 1;
                }

                .plans-header-content {
                    max-width: 600px;
                    margin: 0 auto;
                    padding-top: 2rem;
                }

                .plans-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .plans-header h1 {
                    color: white;
                    font-size: 2.5rem;
                    margin-bottom: 0.5rem;
                }

                .plans-header p {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 1.1rem;
                }

                .plans-section {
                    padding: 3rem 2rem;
                    margin-top: -2rem;
                }

                .plans-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .plan-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    padding: 2rem;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    animation: fadeInUp 0.6s ease forwards;
                    opacity: 0;
                }

                .plan-card.popular {
                    border-color: var(--brand-primary);
                    box-shadow: 0 12px 40px rgba(37, 99, 235, 0.2);
                    transform: scale(1.05);
                }

                .plan-discount {
                    position: absolute;
                    top: -12px;
                    right: 20px;
                    background: linear-gradient(135deg, #ef4444, #f97316);
                    color: white;
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .plan-badge {
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    color: white;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .plan-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .plan-header h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .plan-description {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                }

                .plan-price {
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .original-price {
                    text-decoration: line-through;
                    color: var(--text-muted);
                    font-size: 1.2rem;
                }

                .current-price {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--brand-primary);
                }

                .price-period {
                    color: var(--text-muted);
                }

                .plan-features {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 2rem;
                    flex: 1;
                }

                .plan-features li {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.6rem 0;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }

                .check-icon {
                    color: #22c55e;
                    flex-shrink: 0;
                }

                .plan-cta {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .plan-cta.primary {
                    background: var(--brand-gradient);
                    color: white;
                    border: none;
                }

                .plan-cta.secondary {
                    background: transparent;
                    color: var(--brand-primary);
                    border: 2px solid var(--brand-primary);
                }

                .plan-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(37, 99, 235, 0.3);
                }

                .trust-section {
                    background: #0d0d0d;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    padding: 4rem 2rem;
                }

                .trust-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    text-align: center;
                }

                .trust-container h2 {
                    margin-bottom: 2rem;
                    color: #fff;
                }

                .trust-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .trust-item {
                    padding: 1.5rem;
                }

                .trust-icon {
                    font-size: 2.5rem;
                    color: var(--brand-primary);
                    margin-bottom: 1rem;
                }

                .trust-item h4 {
                    margin-bottom: 0.5rem;
                    color: #e5e7eb;
                }

                .trust-item p {
                    color: #9ca3af;
                    font-size: 0.9rem;
                }

                /* DEMO SECTION */
                .demo-section {
                    padding: 5rem 2rem;
                    background: linear-gradient(135deg, #0c1a3a 0%, #0f2266 100%);
                    border-top: 1px solid rgba(255,255,255,0.08);
                }

                .demo-container {
                    max-width: 1100px;
                    margin: 0 auto;
                }

                .demo-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    align-items: center;
                }

                .demo-info {
                    color: white;
                }

                .demo-info h2 {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    color: white;
                }

                .demo-subtitle {
                    font-size: 1.1rem;
                    opacity: 0.9;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }

                .demo-benefits {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 1.5rem;
                }

                .demo-benefits li {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 0;
                    font-size: 1rem;
                }

                .demo-benefits li svg {
                    color: #22c55e;
                }

                .demo-contact {
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255,255,255,0.2);
                }

                .demo-contact p {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    opacity: 0.9;
                }

                .demo-form {
                    background: var(--bg-card);
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }

                .demo-form h3 {
                    text-align: center;
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .form-group .input {
                    width: 100%;
                }

                .form-group textarea.input {
                    resize: vertical;
                    min-height: 80px;
                }

                .demo-submit {
                    width: 100%;
                    margin-top: 0.5rem;
                }

                .plans-faq {
                    padding: 4rem 2rem;
                }

                .faq-container {
                    max-width: 900px;
                    margin: 0 auto;
                }

                .faq-container h2 {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .faq-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.5rem;
                }

                .faq-item {
                    background: var(--bg-card);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                }

                .faq-item h4 {
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                }

                .faq-item p {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    margin: 0;
                }

                /* PRO MODAL */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }

                .pro-modal {
                    background: var(--bg-card);
                    border-radius: 24px;
                    padding: 2rem;
                    max-width: 480px;
                    width: 100%;
                    position: relative;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: modalSlideIn 0.3s ease;
                }

                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: var(--bg-tertiary);
                    border: none;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .modal-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .modal-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, #ef4444, #f97316);
                    color: white;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }

                .modal-header h2 {
                    margin-bottom: 0.25rem;
                }

                .modal-header p {
                    color: var(--text-muted);
                }

                .modal-price-box {
                    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.05));
                    border: 2px solid var(--brand-primary);
                    border-radius: 16px;
                    padding: 1.5rem;
                    text-align: center;
                    margin-bottom: 1.5rem;
                }

                .modal-original {
                    text-decoration: line-through;
                    color: var(--text-muted);
                    font-size: 1.1rem;
                    display: block;
                }

                .modal-price {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--brand-primary);
                    display: block;
                }

                .modal-price span {
                    font-size: 1rem;
                    font-weight: normal;
                    color: var(--text-muted);
                }

                .modal-savings {
                    display: block;
                    color: #22c55e;
                    font-weight: 600;
                    margin-top: 0.5rem;
                }

                .pro-form .form-group {
                    margin-bottom: 1rem;
                }

                .payment-info {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    margin: 1rem 0;
                }

                .pro-submit {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .secure-note {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    margin-top: 1rem;
                    text-align: center;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 1024px) {
                    .plans-grid {
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .plans-header {
                        padding: 1.5rem 1rem 3rem;
                    }
                    .back-link {
                        position: relative;
                        top: 0;
                        left: 0;
                        display: inline-flex;
                        margin-bottom: 1rem;
                    }
                    .plans-header h1 {
                        font-size: 1.85rem;
                    }
                    .plans-section {
                        padding: 1.5rem 1rem;
                    }
                    .plans-grid, .trust-grid, .faq-grid, .demo-content {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }
                    .plan-card.popular {
                        transform: none;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .pro-modal {
                        width: 95%;
                        padding: 1.5rem;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default Plans;
