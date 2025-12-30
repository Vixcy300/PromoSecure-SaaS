import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiUser, HiShieldCheck, HiArrowRight, HiCamera, HiEye, HiCheck, HiHome } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    otp: ''
  });
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    checkAdminExists();
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

  const checkAdminExists = async () => {
    try {
      const res = await api.get('/auth/check-admin');
      setAdminExists(res.data.exists);
    } catch {
      setAdminExists(false);
    }
  };

  const redirectToDashboard = (role) => {
    const routes = { admin: '/admin', manager: '/manager', promoter: '/promoter' };
    navigate(routes[role] || '/login');
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: formData.email });
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
      if (isAdminRegister) {
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        const res = await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        login(res.data.token, res.data.user);
        toast.success('Admin account created successfully!');
        redirectToDashboard(res.data.user.role);
      } else {
        // Login Logic
        if (loginMethod === 'otp') {
          const res = await api.post('/auth/login-otp', {
            email: formData.email,
            otp: formData.otp,
          });
          login(res.data.token, res.data.user);
        } else {
          const res = await api.post('/auth/login', {
            email: formData.email,
            password: formData.password,
          });
          login(res.data.token, res.data.user);
        }
        toast.success(`Welcome back!`);
        // User role redirection is handled by useEffect or explicit navigation if needed
        // But login context updates user which triggers useEffect
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    }
    setLoading(false);
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
              <span>Production Ready SaaS</span>
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
                <span className="stat-value">Free</span>
                <span className="stat-label">To Start</span>
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
              <h2>{isAdminRegister ? 'Create Admin Account' : 'Welcome Back'}</h2>
              <p className="text-muted">
                {isAdminRegister
                  ? 'Set up your PromoSecure platform'
                  : 'Sign in to continue to your dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {isAdminRegister && (
                <div className="input-group">
                  <label>
                    <HiUser className="label-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label>
                  <HiMail className="label-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {!isAdminRegister && loginMethod === 'password' && (
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
                    minLength={8}
                  />
                </div>
              )}

              {/* Admin Register Password Fields */}
              {isAdminRegister && (
                <>
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
                      required={isAdminRegister}
                      minLength={8}
                    />
                  </div>
                  <div className="input-group">
                    <label>
                      <HiLockClosed className="label-icon" />
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required={isAdminRegister}
                      minLength={8}
                    />
                  </div>
                </>
              )}

              {/* OTP Input */}
              {!isAdminRegister && loginMethod === 'otp' && otpSent && (
                <div className="input-group">
                  <label>
                    <HiShieldCheck className="label-icon" />
                    Enter OTP
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

              {!isAdminRegister && loginMethod === 'otp' && !otpSent ? (
                <button type="button" onClick={handleSendOTP} className="btn btn-primary btn-lg w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Get OTP Code'}
                </button>
              ) : (
                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                  {loading ? (
                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                  ) : (
                    <>
                      {isAdminRegister ? 'Create Platform' : 'Sign In'}
                      <HiArrowRight />
                    </>
                  )}
                </button>
              )}

              {!isAdminRegister && (
                <div className="form-switch" style={{ borderTop: 'none', marginTop: '0.5rem', paddingTop: 0 }}>
                  <button
                    type="button"
                    className="btn btn-ghost w-full text-sm"
                    onClick={() => {
                      setLoginMethod(loginMethod === 'otp' ? 'password' : 'otp');
                      setOtpSent(false);
                    }}
                  >
                    {loginMethod === 'otp' ? 'Login with Password' : 'Login with OTP'}
                  </button>
                </div>
              )}
            </form>

            {!adminExists && (
              <div className="form-switch">
                <button
                  className="btn btn-ghost w-full"
                  onClick={() => setIsAdminRegister(!isAdminRegister)}
                >
                  {isAdminRegister
                    ? 'Already have an account? Sign In'
                    : 'First time? Create Admin Account'}
                </button>
              </div>
            )}

            <div className="form-footer">
              <p className="text-xs text-muted text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
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
          background: radial-gradient(circle, rgba(124, 58, 237, 0.2), transparent 60%);
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
          background: var(--brand-glow-soft);
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-brand);
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .hero-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .brand-gradient {
          background: var(--brand-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 400px;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-primary);
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .feature-content {
          display: flex;
          flex-direction: column;
        }

        .feature-title {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .feature-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--brand-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* Form Panel */
        .login-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: var(--bg-primary);
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-logo {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .form-header h2 {
          margin-bottom: 0.5rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .label-icon {
          color: var(--text-muted);
        }

        .form-switch {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .home-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          transition: color var(--transition-fast);
        }

        .home-link:hover {
          color: var(--brand-primary);
        }

        .form-footer {
          margin-top: 2rem;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }

          .login-hero {
            display: none;
          }

          .login-form-panel {
            padding: 2rem;
          }
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 0;
          }

          .login-container {
            border-radius: 0;
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
