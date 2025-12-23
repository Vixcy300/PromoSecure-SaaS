import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiQuestionMarkCircle, HiChevronDown, HiChevronUp, HiCode, HiExternalLink, HiSparkles, HiClock, HiCheck } from 'react-icons/hi';

const faqs = [
  {
    category: 'About PromoSecure',
    items: [
      {
        q: 'What is PromoSecure?',
        a: 'PromoSecure is the industry\'s only secure, privacy-first promotional verification platform. It allows on-field promoters to capture photos as proof of work while automatically protecting public privacy through AI-powered face blurring. Currently, PromoSecure stands as the ONLY secure solution available in the market that combines verification with privacy protection.'
      },
      {
        q: 'Why is PromoSecure the only secure option?',
        a: 'Unlike traditional photo collection methods, PromoSecure processes all face blurring on-device before upload, ensuring original photos never leave the promoter\'s device. We use enterprise-grade security with JWT authentication, rate limiting, and encrypted storage. No other solution in the market offers this level of privacy-first architecture.'
      },
      {
        q: 'How does face blurring work?',
        a: 'Our AI uses TensorFlow.js with MediaPipe Face Detector for 4-layer privacy protection: heavy pixelation, multiple Gaussian blur passes, noise overlay, and final pixelation. This happens entirely on your device before upload—managers never see unblurred faces.'
      },
    ]
  },
  {
    category: 'For Promoters',
    items: [
      {
        q: 'How do I create a batch?',
        a: 'Click "New Batch" on your dashboard, enter the batch title and optional description. Then click "Create & Start Capturing" to begin adding photos.'
      },
      {
        q: 'What if no face is detected?',
        a: 'The AI requires at least one face to be visible. Ensure the person is facing the camera with adequate lighting. If no face is detected, you\'ll be asked to retake the photo.'
      },
      {
        q: 'What happens with duplicate photos?',
        a: 'Our AI compares each photo against existing ones using advanced image hashing and face signature technology. Only photos with 95%+ similarity are flagged as duplicates—different people won\'t be incorrectly marked.'
      },
    ]
  },
  {
    category: 'For Managers',
    items: [
      {
        q: 'How do I add promoters?',
        a: 'Go to "Promoters" in your dashboard and click "Add Promoter". Enter their name, email, and password. The number of promoters depends on your subscription plan.'
      },
      {
        q: 'Can I see original unblurred photos?',
        a: 'No—this is by design. For privacy protection, managers only see blurred versions. The AI verification summary provides confidence scores that photos are legitimate and show unique individuals.'
      },
    ]
  },
  {
    category: 'Subscription & Limits',
    items: [
      {
        q: 'How much storage does PromoSecure use?',
        a: 'PromoSecure uses industry-standard cloud infrastructure with top-tier MongoDB Atlas database. Photos are compressed to ~100KB each, providing efficient storage. Your storage limits depend on your subscription tier.'
      },
      {
        q: 'Is there a usage limit?',
        a: 'Yes, based on your subscription plan. Standard limits include API request quotas, login attempt limits for security, and hourly photo upload caps. These limits ensure platform stability and prevent abuse while allowing normal business usage. Premium plans offer higher limits.'
      },
      {
        q: 'What subscription plans are available?',
        a: 'PromoSecure offers flexible subscription tiers: Starter (perfect for small teams), Professional (for growing businesses), and Enterprise (unlimited usage with priority support). Contact us for custom enterprise solutions.'
      },
    ]
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'What browsers are supported?',
        a: 'PromoSecure works best on Chrome, Edge, and Firefox. For mobile, we recommend Chrome for optimal camera and AI performance. Safari has limited WebGL support which may affect AI processing speed.'
      },
      {
        q: 'Is my data secure?',
        a: 'Absolutely. We use JWT authentication, bcrypt password hashing, HTTPS encryption, rate limiting, and automatic data deletion after 30 days. Your privacy is our top priority.'
      },
    ]
  },
];

const upcomingFeatures = [
  {
    title: 'Multi-Language Support',
    description: 'Support for Hindi, Tamil, Telugu, and 10+ regional languages',
    date: 'January 2026',
    status: 'in-progress'
  },
  {
    title: 'Offline Mode',
    description: 'Capture photos offline and sync when connected',
    date: 'February 2026',
    status: 'planned'
  },
  {
    title: 'Video Verification',
    description: 'Short video clips as proof with AI face blurring',
    date: 'March 2026',
    status: 'planned'
  },
  {
    title: 'Advanced Analytics Dashboard',
    description: 'Detailed performance insights, heat maps, and trend analysis',
    date: 'April 2026',
    status: 'planned'
  },
  {
    title: 'Mobile App (Android & iOS)',
    description: 'Native mobile apps for faster, smoother experience',
    date: 'June 2026',
    status: 'planned'
  },
  {
    title: 'Client Portal',
    description: 'Clients can view their campaign progress and reports directly',
    date: 'July 2026',
    status: 'planned'
  },
  {
    title: 'AI-Powered Fraud Detection',
    description: 'Advanced ML to detect fake or manipulated photos',
    date: 'September 2026',
    status: 'planned'
  },
  {
    title: 'WhatsApp Integration',
    description: 'Get batch updates and submit photos via WhatsApp',
    date: 'November 2026',
    status: 'planned'
  },
];

const Help = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page help-page">
      <button className="btn btn-ghost mb-3" onClick={() => navigate(-1)}>
        <HiArrowLeft /> Back
      </button>

      <div className="help-header">
        <div className="help-icon">
          <HiQuestionMarkCircle />
        </div>
        <h1>Help & FAQ</h1>
        <p className="text-muted">Everything you need to know about PromoSecure</p>
      </div>

      {/* About App Card */}
      <div className="about-app-card card">
        <div className="app-badge">🔒 Industry's Only Secure Solution</div>
        <h2>Why PromoSecure?</h2>
        <p>
          PromoSecure is the <strong>only privacy-first promotional verification platform</strong> available today.
          We address the fundamental challenge between marketing companies needing proof of work and the
          public's right to privacy. With AI face blurring, duplicate detection, GPS verification, and
          30-day automatic data deletion, we provide complete transparency and trust.
        </p>
        <div className="app-highlights">
          <div className="highlight">
            <span className="h-icon">🛡️</span>
            <span>Privacy First</span>
          </div>
          <div className="highlight">
            <span className="h-icon">🤖</span>
            <span>AI-Powered</span>
          </div>
          <div className="highlight">
            <span className="h-icon">🗑️</span>
            <span>30-Day Delete</span>
          </div>
          <div className="highlight">
            <span className="h-icon">📊</span>
            <span>Real-time Analytics</span>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-container">
        {faqs.map((category, catIndex) => (
          <div key={category.category} className="faq-category">
            <h2 className="category-title">{category.category}</h2>
            <div className="faq-list">
              {category.items.map((item, itemIndex) => {
                const key = `${catIndex}-${itemIndex}`;
                const isOpen = openItems[key];
                return (
                  <div key={itemIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-question"
                      onClick={() => toggleItem(catIndex, itemIndex)}
                    >
                      <span>{item.q}</span>
                      {isOpen ? <HiChevronUp /> : <HiChevronDown />}
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Features */}
      <div className="upcoming-section">
        <div className="section-header">
          <HiSparkles className="section-icon" />
          <h2>Upcoming Features</h2>
          <p className="text-muted">What's coming to PromoSecure</p>
        </div>
        <div className="roadmap">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className={`roadmap-item ${feature.status}`}>
              <div className="roadmap-date">
                <HiClock />
                <span>{feature.date}</span>
              </div>
              <div className="roadmap-content">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
              <div className={`roadmap-status ${feature.status}`}>
                {feature.status === 'in-progress' ? '🔄 In Progress' : '📋 Planned'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer & Collaboration */}
      <div className="developer-section card">
        <div className="dev-header">
          <HiCode className="dev-icon" />
          <h3>Open for Collaboration</h3>
        </div>
        <p className="text-muted">
          PromoSecure is built with passion for privacy and innovation. If you're interested in
          contributing, partnering, or have ideas for new features, I'd love to connect!
        </p>
        <div className="github-card">
          <div className="github-avatar">V</div>
          <div className="github-info">
            <span className="github-name">Vignesh</span>
            <span className="github-handle">@Vixcy300</span>
          </div>
          <a
            href="https://github.com/Vixcy300"
            target="_blank"
            rel="noopener noreferrer"
            className="github-btn"
          >
            <HiCode /> View GitHub <HiExternalLink />
          </a>
        </div>
        <p className="collab-note">
          💡 Have a feature idea? Want to integrate PromoSecure with your platform?
          Reach out via GitHub or email at <a href="mailto:vigneshigt@gmail.com">vigneshigt@gmail.com</a>
        </p>
      </div>

      {/* Legal Links */}
      <div className="help-contact card mt-3">
        <h3>Legal & Policies</h3>
        <div className="legal-links">
          <Link to="/privacy" className="legal-link">Privacy Policy</Link>
          <Link to="/terms" className="legal-link">Terms of Service</Link>
        </div>
        <p className="text-muted mt-2">Need additional help? Contact your manager or system administrator.</p>
      </div>

      <style>{`
        .help-page {
          max-width: 900px;
        }

        .help-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .help-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: var(--brand-gradient);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: white;
          box-shadow: var(--shadow-glow);
        }

        .help-header h1 {
          margin-bottom: 0.5rem;
        }

        /* About App Card */
        .about-app-card {
          background: linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(20, 184, 166, 0.05));
          border-color: var(--brand-primary);
          margin-bottom: 2rem;
          text-align: center;
        }

        .app-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: var(--brand-gradient);
          color: white;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .about-app-card h2 {
          margin-bottom: 1rem;
        }

        .about-app-card p {
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 700px;
          margin: 0 auto 1.5rem;
        }

        .app-highlights {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .highlight {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* FAQ Styles */
        .faq-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .category-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          padding-left: 0.5rem;
          border-left: 3px solid var(--brand-primary);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all var(--transition-fast);
        }

        .faq-item.open {
          border-color: var(--border-hover);
        }

        .faq-question {
          width: 100%;
          padding: 1.25rem;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .faq-question:hover {
          color: var(--brand-primary);
        }

        .faq-question svg {
          font-size: 1.25rem;
          flex-shrink: 0;
          color: var(--text-muted);
        }

        .faq-answer {
          padding: 0 1.25rem 1.25rem;
          animation: slideDown 0.2s ease;
        }

        .faq-answer p {
          line-height: 1.7;
          color: var(--text-secondary);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Upcoming Features */
        .upcoming-section {
          margin-bottom: 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .section-icon {
          font-size: 2rem;
          color: var(--brand-primary);
          margin-bottom: 0.5rem;
        }

        .section-header h2 {
          margin-bottom: 0.25rem;
        }

        .roadmap {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .roadmap-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .roadmap-item.in-progress {
          border-color: var(--brand-primary);
          background: linear-gradient(135deg, rgba(13, 148, 136, 0.05), transparent);
        }

        .roadmap-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          min-width: 120px;
        }

        .roadmap-content {
          flex: 1;
        }

        .roadmap-content h4 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
        }

        .roadmap-content p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .roadmap-status {
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .roadmap-status.in-progress {
          color: var(--brand-primary);
          font-weight: 600;
        }

        /* Developer Section */
        .developer-section {
          text-align: center;
        }

        .dev-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .dev-icon {
          font-size: 1.5rem;
          color: var(--brand-primary);
        }

        .dev-header h3 {
          margin: 0;
        }

        .github-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #24292e;
          border-radius: var(--radius-lg);
          margin: 1.5rem 0;
          color: white;
        }

        .github-avatar {
          width: 48px;
          height: 48px;
          background: var(--brand-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .github-info {
          display: flex;
          flex-direction: column;
          text-align: left;
          flex: 1;
        }

        .github-name {
          font-weight: 600;
        }

        .github-handle {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .github-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          color: #24292e;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .github-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .collab-note {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .collab-note a {
          color: var(--brand-primary);
        }

        /* Legal Links */
        .legal-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1rem;
        }

        .legal-link {
          padding: 0.5rem 1rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .legal-link:hover {
          color: var(--brand-primary);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .roadmap-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .roadmap-date {
            min-width: auto;
          }

          .github-card {
            flex-direction: column;
            text-align: center;
          }

          .github-info {
            text-align: center;
          }

          .app-highlights {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Help;
