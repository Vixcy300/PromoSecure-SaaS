import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiShieldCheck,
  HiCamera,
  HiEye,
  HiCheck,
  HiChartBar,
  HiUserGroup,
  HiLocationMarker,
  HiClock,
  HiLightningBolt,
  HiChevronDown,
  HiChevronUp,
  HiArrowRight,
  HiMail,
  HiPhone,
  HiGlobe
} from 'react-icons/hi';

const LandingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [isVisible, setIsVisible] = useState({});
  const observerRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    observerRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: HiCamera,
      title: 'Smart Photo Capture',
      desc: 'In-app camera with real-time face detection and instant processing. Works offline for field promoters.',
      color: '#2563eb'
    },
    {
      icon: HiEye,
      title: 'AI Face Blurring',
      desc: '4-layer privacy protection automatically blurs all faces. Protects public privacy while verifying work.',
      color: '#3b82f6'
    },
    {
      icon: HiCheck,
      title: 'Duplicate Detection',
      desc: 'AI compares photos to detect same person. Prevents fraud with image hashing and face signatures.',
      color: '#0ea5e9'
    },
    {
      icon: HiLocationMarker,
      title: 'GPS Location Tracking',
      desc: 'Automatically captures location and timestamp. Verify where and when photos were taken.',
      color: '#6366f1'
    },
    {
      icon: HiChartBar,
      title: 'Analytics Dashboard',
      desc: 'Real-time insights on promoter performance. Track batches, approval rates, and team metrics.',
      color: '#8b5cf6'
    },
    {
      icon: HiUserGroup,
      title: 'Team Management',
      desc: 'Hierarchical access control. Admins manage managers, managers manage promoters.',
      color: '#1d4ed8'
    }
  ];

  const howItWorks = [
    { step: '01', title: 'Create Batch', desc: 'Promoter creates a new batch with title, description, and location.' },
    { step: '02', title: 'Capture Photos', desc: 'Use the in-app camera. AI detects faces and applies heavy blur automatically.' },
    { step: '03', title: 'AI Verification', desc: 'System checks for duplicates, validates uniqueness, and generates verification score.' },
    { step: '04', title: 'Manager Review', desc: 'Manager views blurred photos and AI summary, then approves or rejects.' }
  ];

  const faqs = [
    {
      q: 'How does face blurring protect privacy?',
      a: 'Our AI uses TensorFlow.js to detect faces on-device before upload. We apply 4 layers of protection: heavy pixelation, multiple Gaussian blur passes, noise overlay, and secondary pixelation. The original unblurred photos never leave the device.'
    },
    {
      q: 'Can managers see the original unblurred photos?',
      a: 'No. For privacy reasons, managers can only see the blurred versions. This protects the public while still allowing verification that promotional work was completed.'
    },
    {
      q: 'How does duplicate detection work?',
      a: 'We use two methods: perceptual image hashing (compares overall image similarity) and face signature comparison (analyzes facial proportions and positions). Photos above 80% similarity are flagged as potential duplicates.'
    },
    {
      q: 'Is there a limit on photos or batches?',
      a: 'Storage limits depend on your subscription plan. The Starter plan includes 5,000 photos, Professional plan includes 25,000 photos, and Enterprise plans offer unlimited storage. Contact us for custom enterprise solutions.'
    },
    {
      q: 'Does it work offline?',
      a: 'Photo capture and face blurring work offline since AI runs on-device. Internet is required only for uploading batches and syncing with the server.'
    },
    {
      q: 'What security measures are in place?',
      a: 'We use JWT authentication, bcrypt password hashing, rate limiting, HTTPS encryption, input validation, and audit logging. All data is encrypted in transit and at rest.'
    }
  ];

  const stats = [
    { value: '100%', label: 'Privacy Protected' },
    { value: '4-Layer', label: 'Face Blur System' },
    { value: '<2s', label: 'Processing Time' },
    { value: 'Free', label: 'To Get Started' }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo hover-pop">
            <span className="logo-icon">🔒</span>
            <span className="logo-text">PromoSecure</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
            <a href="/plans" className="discount-link">🔥 50% Off Plan</a>
            <a href="/blog">Blog</a>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient-1"></div>
          <div className="hero-gradient-2"></div>
        </div>
        <div className="hero-container">
          <div className="hero-badge">
            <HiLightningBolt />
            <span>Privacy-First Verification Platform</span>
          </div>
          <h1 className="hero-title hover-pop">
            Verify Promotional Work<br />
            <span className="gradient-text">Without Compromising Privacy</span>
          </h1>
          <p className="hero-subtitle">
            AI-powered face blurring protects the public while giving managers verified proof
            of on-field promotional activities. Smart duplicate detection prevents fraud.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Start Free Trial <HiArrowRight />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </button>
          </div>
          <div className="hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="hero-stat">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section" ref={el => observerRefs.current[0] = el}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything You Need for<br />Promotional Verification</h2>
            <p>Built for field teams who need privacy-compliant proof of work</p>
          </div>
          <div className={`features-grid ${isVisible['features'] ? 'visible' : ''}`}>
            {features.map((feature, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section" ref={el => observerRefs.current[1] = el}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Process</span>
            <h2>Simple 4-Step Workflow</h2>
            <p>From capture to approval in minutes</p>
          </div>
          <div className={`steps-container ${isVisible['how-it-works'] ? 'visible' : ''}`}>
            {howItWorks.map((item, i) => (
              <div key={i} className="step-card" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="step-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section" ref={el => observerRefs.current[2] = el}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about PromoSecure</p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  {openFaq === i ? <HiChevronUp /> : <HiChevronDown />}
                </button>
                {openFaq === i && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section" ref={el => observerRefs.current[4] = el}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Pricing</span>
            <h2>Simple, Transparent Pricing</h2>
            <p>Start with a trial, scale as you grow</p>
          </div>
          <div className={`pricing-grid ${isVisible['pricing'] ? 'visible' : ''}`}>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Trial</h3>
                <div className="pricing-price">
                  <span className="price">₹0</span>
                  <span className="period">/14 days</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✓ Full access to all features</li>
                <li>✓ Up to 3 Promoters</li>
                <li>✓ 100 photos included</li>
                <li>✓ Pre-populated sample data</li>
                <li>✓ Email support</li>
              </ul>
              <button className="btn btn-secondary w-full" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Request Demo Access</button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-discount">50% OFF</div>
              <div className="pricing-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="pricing-price">
                  <span className="price-old">₹2,499</span>
                  <span className="price">₹1,249</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✓ Unlimited Managers</li>
                <li>✓ Unlimited Promoters</li>
                <li>✓ Unlimited photos</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority WhatsApp support</li>
                <li>✓ API access</li>
                <li>✓ Custom branding</li>
              </ul>
              <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>Start Pro Now</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Enterprise</h3>
                <div className="pricing-price">
                  <span className="price">Custom</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>✓ Everything in Pro</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated account manager</li>
                <li>✓ SLA guarantee</li>
                <li>✓ On-premise deployment</li>
                <li>✓ Training & onboarding</li>
              </ul>
              <button className="btn btn-secondary w-full" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* Get Demo Section */}
      <section id="contact" className="contact-section" ref={el => observerRefs.current[3] = el}>
        <div className="section-container">
          <div className="contact-grid">
            <div className="contact-info">
              <span className="section-badge">Get Demo</span>
              <h2>Request a Demo</h2>
              <p>
                Want to see PromoSecure in action? We're happy to provide a demo account
                so you can experience our privacy-first platform firsthand.
              </p>
              <div className="demo-features">
                <div className="demo-feature">✅ Full access to all features</div>
                <div className="demo-feature">✅ Pre-populated sample data</div>
                <div className="demo-feature">✅ Explore AI face blurring</div>
                <div className="demo-feature">✅ Test the mobile experience</div>
              </div>
              <div className="contact-methods">
                <div className="contact-method">
                  <HiMail />
                  <span>vigneshigt@gmail.com</span>
                </div>
              </div>
            </div>
            <form className="contact-form demo-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you! We will send demo credentials to your email within 24 hours.'); }}>
              <h3>Get Your Demo Access</h3>
              <div className="input-group">
                <label>Your Name *</label>
                <input type="text" className="input" placeholder="Enter your name" required />
              </div>
              <div className="input-group">
                <label>Email Address *</label>
                <input type="email" className="input" placeholder="your@email.com" required />
              </div>
              <div className="input-group">
                <label>Company / Organization</label>
                <input type="text" className="input" placeholder="Your company name (optional)" />
              </div>
              <div className="input-group">
                <label>How did you hear about us? <span className="label-note">(We know it's not Google 😄)</span></label>
                <select className="input">
                  <option value="">Select...</option>
                  <option value="referral">Friend / Colleague</option>
                  <option value="github">GitHub</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full">
                🚀 Request Demo Access
              </button>
              <p className="form-note">We'll send demo credentials within 24 hours</p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="nav-logo">
              <span className="logo-icon">🔒</span>
              <span className="logo-text">PromoSecure</span>
            </div>
            <p>Privacy-first promotional verification platform with AI-powered face blurring.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/privacy">Privacy Policy</a>
              <a href="/about">About Us</a>
              <a href="/terms">Terms of Service</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#contact">Contact Us</a>
              <a href="/help">Help Center</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024-2026 PromoSecure. All rights reserved. Built with ❤️ by Vignesh</p>
        </div>
      </footer>

      <style>{`
        .landing-page {
          background: var(--bg-primary);
          min-height: 100vh;
        }

        /* Navigation */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-links a {
          color: var(--text-secondary);
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .nav-links a:hover {
          color: var(--text-primary);
        }

        .nav-links .discount-link {
          color: #ef4444 !important;
          font-weight: 700;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { 
            text-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
          }
          50% { 
            text-shadow: 0 0 15px rgba(239, 68, 68, 0.6);
          }
        }

        .nav-actions {
          display: flex;
          gap: 0.75rem;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          padding: 10rem 2rem 6rem;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .hero-gradient-1 {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 60%;
          height: 80%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 60%);
        }

        .hero-gradient-2 {
          position: absolute;
          bottom: -20%;
          left: -10%;
          width: 50%;
          height: 60%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 60%);
        }

        .hero-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--primary-50);
          border: 1px solid var(--primary-200);
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary-600);
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
          cursor: default;
        }

        .gradient-text {
          background: var(--brand-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Hover Pop Animation */
        .hover-pop {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      filter 0.3s ease;
          cursor: pointer;
        }

        .hover-pop:hover {
          transform: scale(1.05) translateY(-4px);
          filter: drop-shadow(0 10px 20px rgba(13, 148, 136, 0.2));
        }

        .nav-logo.hover-pop:hover {
          transform: scale(1.08);
        }

        .hero-title.hover-pop:hover {
          transform: scale(1.03) translateY(-6px);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto 2.5rem;
          line-height: 1.7;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 4rem;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 4rem;
          padding-top: 3rem;
          border-top: 1px solid var(--border-color);
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          font-family: var(--font-display);
          background: var(--brand-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-stat .stat-label {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        /* Section Styles */
        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-block;
          padding: 0.375rem 1rem;
          background: var(--primary-50);
          color: var(--primary-600);
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .section-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 0;
          background: var(--bg-secondary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .features-grid.visible .feature-card {
          animation: fadeInUp 0.6s ease forwards;
        }

        .feature-card {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          padding: 2rem;
          border: 1px solid var(--border-color);
          transition: all var(--transition-normal);
          opacity: 0;
          transform: translateY(20px);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.25rem;
        }

        .feature-card h3 {
          font-size: 1.15rem;
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.6;
        }

        /* How It Works */
        .how-section {
          padding: 6rem 0;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .steps-container.visible .step-card {
          animation: fadeInUp 0.6s ease forwards;
        }

        .step-card {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          padding: 2rem;
          border: 1px solid var(--border-color);
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
        }

        .step-number {
          width: 48px;
          height: 48px;
          background: var(--brand-gradient);
          color: white;
          font-weight: 800;
          font-size: 1.1rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }

        .step-card h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .step-card p {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin: 0;
        }

        /* FAQ Section */
        .faq-section {
          padding: 6rem 0;
          background: var(--bg-secondary);
        }

        .faq-list {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .faq-item.open {
          border-color: var(--primary-300);
        }

        .faq-question {
          width: 100%;
          padding: 1.25rem 1.5rem;
          background: none;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .faq-question svg {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .faq-answer {
          padding: 0 1.5rem 1.25rem;
          animation: slideDown 0.2s ease;
        }

        .faq-answer p {
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.7;
        }

        /* Pricing Section */
        .pricing-section {
          padding: 6rem 0;
          background: var(--bg-secondary);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .pricing-grid.visible .pricing-card {
          animation: fadeInUp 0.6s ease forwards;
        }

        .pricing-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          opacity: 0;
        }

        .pricing-card.featured {
          border-color: var(--brand-primary);
          box-shadow: 0 8px 30px rgba(37, 99, 235, 0.15);
          transform: scale(1.05);
        }

        .pricing-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--brand-gradient);
          color: white;
          padding: 0.35rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .pricing-header h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .pricing-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.25rem;
        }

        .pricing-price .price {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--brand-primary);
        }

        .pricing-price .period {
          color: var(--text-muted);
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
          flex: 1;
        }

        .pricing-features li {
          padding: 0.5rem 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .pricing-discount {
          position: absolute;
          top: -12px;
          right: 20px;
          background: linear-gradient(135deg, #ef4444, #f97316);
          color: white;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          z-index: 1;
        }

        .price-old {
          text-decoration: line-through;
          color: var(--text-muted);
          font-size: 1.2rem;
          font-weight: 400;
          margin-right: 0.5rem;
        }

        .plans-link {
          color: var(--brand-primary) !important;
          font-weight: 600 !important;
        }

        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
          .pricing-card.featured {
            transform: none;
          }
        }

        /* Contact Section */
        .contact-section {
          padding: 6rem 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .contact-info h2 {
          margin-top: 1rem;
        }

        .contact-info p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contact-method {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-secondary);
        }

        .contact-method svg {
          color: var(--brand-primary);
          font-size: 1.25rem;
        }

        .contact-form {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-card);
        }

        .contact-form h3 {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .demo-features {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .demo-feature {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .form-note {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 1rem 0 0;
        }

        .label-note {
          font-weight: 400;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Footer */
        .landing-footer {
          background: var(--slate-900);
          color: white;
          padding: 4rem 0 0;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 3rem;
          display: grid;
          grid-template-columns: 2fr 3fr;
          gap: 4rem;
        }

        .footer-brand .logo-text {
          color: white;
          -webkit-text-fill-color: white;
        }

        .footer-brand p {
          color: var(--slate-400);
          margin-top: 1rem;
          font-size: 0.95rem;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .footer-col h4 {
          color: white;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .footer-col a {
          display: block;
          color: var(--slate-400);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          transition: color var(--transition-fast);
        }

        .footer-col a:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid var(--slate-800);
          padding: 1.5rem 2rem;
          text-align: center;
        }

        .footer-bottom p {
          color: var(--slate-500);
          font-size: 0.85rem;
          margin: 0;
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .steps-container {
            grid-template-columns: repeat(2, 1fr);
          }

          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .hero-section {
            padding: 8rem 1.5rem 4rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-cta {
            flex-direction: column;
          }

          .hero-stats {
            gap: 2rem;
            flex-wrap: wrap;
          }

          .features-grid,
          .steps-container {
            grid-template-columns: 1fr;
          }

          .footer-container {
            grid-template-columns: 1fr;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div >
  );
};

export default LandingPage;
