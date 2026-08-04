import { useState, useEffect } from 'react';
import { Spinner } from '../components/ui/spinner';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiShieldCheck, HiArrowRight, HiCamera, HiEye, HiCheck, HiHome } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' as default
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (user) {
      redirectToDashboard(user.role);
    }

    // Timer countdown
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [user, resendTimer]);

  const redirectToDashboard = (role) => {
    const routes = { admin: '/admin', manager: '/manager', promoter: '/promoter', client: '/client' };
    navigate(routes[role] || '/login');
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', {
        email: formData.email,
        type: 'login'
      });
      setOtpSent(true);
      setResendTimer(60);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMethod === 'otp') {
        const res = await api.post('/auth/login-otp', {
          email: formData.email,
          otp: formData.otp,
        });
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        redirectToDashboard(res.data.user.role);
      } else {
        const res = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        redirectToDashboard(res.data.user.role);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: HiCamera, title: 'Photo Capture', desc: 'In-app camera with real-time preview' },
    { icon: HiEye, title: 'AI Face Blur', desc: '4-layer privacy protection system' },
    { icon: HiCheck, title: 'Smart Verification', desc: 'Duplicate detection & uniqueness check' },
    { icon: HiShieldCheck, title: 'Enterprise Security', desc: 'JWT auth, rate limiting, encryption' },
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Panel - Branding */}
        <div className="login-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span>Enterprise SaaS Platform</span>
            </div>

            <h1 className="hero-title">
              <span className="brand-gradient">PromoSecure</span>
            </h1>

            <p className="hero-subtitle">
              Privacy-first promotional verification platform with AI-powered face blurring
              and smart duplicate detection.
            </p>

            <div className="hero-features">
              {features.map((feature, index) => (
                <div key={index} className="hero-feature">
                  <div className="feature-icon">
                    <feature.icon />
                  </div>
                  <div className="feature-content">
                    <span className="feature-title">{feature.title}</span>
                    <span className="feature-desc">{feature.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">100%</span>
                <span className="stat-label">Privacy</span>
              </div>
              <div className="stat">
                <span className="stat-value">4-Layer</span>
                <span className="stat-label">Face Blur</span>
              </div>
              <div className="stat">
                <span className="stat-value">GDPR</span>
                <span className="stat-label">Compliant</span>
              </div>
            </div>
          </div>

          <div className="hero-gradient"></div>
        </div>

        {/* Right Panel - Form */}
        <div className="login-form-panel">
          <div className="form-container">
            <Link to="/" className="home-link">
              <HiHome /> Back to Home
            </Link>
            <div className="form-header">
              <div className="form-logo">🔒</div>
              <h2>Welcome Back</h2>
              <p className="text-muted">
                Sign in with your enterprise credentials to access your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>
                  <HiMail className="label-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {loginMethod === 'password' && (
                <div className="input-group">
                  <label>
                    <HiLockClosed className="label-icon" />
                    Password
                  </label>
                  <input
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* OTP Input */}
              {loginMethod === 'otp' && otpSent && (
                <div className="input-group">
                  <label>
                    <HiShieldCheck className="label-icon" />
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="123456"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    required
                    maxLength={6}
                    style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2em' }}
                  />
                  <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    {resendTimer > 0 ? (
                      <span className="text-xs text-muted">Resend in {resendTimer}s</span>
                    ) : (
                      <button type="button" onClick={handleSendOTP} className="text-xs text-brand btn-ghost">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {loginMethod === 'otp' && !otpSent ? (
                <button type="button" onClick={handleSendOTP} className="btn btn-primary btn-lg w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Get OTP Code'}
                </button>
              ) : (
                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                  {loading ? (
                    <Spinner size={18} />
                  ) : (
                    <>
                      Sign In
                      <HiArrowRight />
                    </>
                  )}
                </button>
              )}

              <div className="form-switch" style={{ borderTop: 'none', marginTop: '0.75rem', paddingTop: 0 }}>
                <button
                  type="button"
                  className="btn btn-ghost w-full text-sm"
                  onClick={() => {
                    setLoginMethod(loginMethod === 'otp' ? 'password' : 'otp');
                    setOtpSent(false);
                  }}
                >
                  {loginMethod === 'otp' ? 'Sign in with Password instead' : 'Sign in with Email OTP instead'}
                </button>
              </div>
            </form>

            <div className="form-footer">
              <p className="text-xs text-muted text-center">
                Protected by PromoSecure Enterprise Security. <Link to="/terms" style={{ color: 'var(--brand-primary)' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--brand-primary)' }}>Privacy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 1200px;
          min-height: 700px;
          background: var(--bg-secondary);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
        }

        /* Hero Panel */
        .login-hero {
          position: relative;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-elevated));
        }

        .hero-gradient {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(0, 102, 204, 0.08), transparent 60%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--primary-50);
          border: 1px solid var(--primary-200);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--brand-primary);
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand-primary);
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .brand-gradient {
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--primary-50);
          color: var(--brand-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .feature-content {
          display: flex;
          flex-direction: column;
        }

        .feature-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .feature-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Form Panel */
        .login-form-panel {
          padding: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .home-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: var(--transition);
        }

        .home-link:hover {
          color: var(--brand-primary);
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-logo {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .form-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .label-icon {
          color: var(--text-muted);
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .form-switch {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .form-footer {
          margin-top: 2rem;
        }

        @media (max-width: 900px) {
          .login-container {
            grid-template-columns: 1fr;
          }

          .login-hero {
            display: none;
          }

          .login-form-panel {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
