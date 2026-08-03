import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import { CanvasRevealEffect } from '../components/CanvasRevealEffect';
import toast from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('otp');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    setupKey: ''
  });

  const [step, setStep] = useState("auth");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeInputRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  useEffect(() => {
    checkAdminExists();
    if (user) redirectToDashboard(user.role);

    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(p => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [user, resendTimer]);

  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeInputRefs.current[0]?.focus(), 500);
    }
  }, [step]);

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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
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
          setupKey: formData.setupKey
        });
        login(res.data.token, res.data.user);
        toast.success('Admin account created!');
        triggerSuccess();
      } else {
        if (loginMethod === 'password') {
          const res = await api.post('/auth/login', {
            email: formData.email,
            password: formData.password
          });
          login(res.data.token, res.data.user);
          toast.success('Login successful!');
          triggerSuccess();
        } else {
          await api.post('/auth/send-otp', { email: formData.email, type: 'login' });
          setResendTimer(60);
          toast.success('OTP sent to your email!');
          setStep("code");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleCodeChange = async (index, value) => {
    // Get only the last character entered (helps on Android/mobile auto-completes)
    const char = value.slice(-1);
    
    // Only allow numbers
    if (char && !/^\d$/.test(char)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    if (char) {
      if (index < 5) {
        codeInputRefs.current[index + 1]?.focus();
      } else {
        // Last input filled, let's verify if all are filled
        if (newCode.every(d => d !== "")) {
          verifyOTP(newCode.join(''));
        }
      }
    }
  };

  const verifyOTP = async (otpValue) => {
    setLoading(true);
    try {
      // Corrected to use '/auth/login-otp' to fetch token & user data
      const res = await api.post('/auth/login-otp', { email: formData.email, otp: otpValue });
      login(res.data.token, res.data.user);
      toast.success('Login successful!');
      triggerSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      setCode(["", "", "", "", "", ""]);
      codeInputRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  const triggerSuccess = () => {
    setReverseCanvasVisible(true);
    setTimeout(() => setInitialCanvasVisible(false), 50);
    setTimeout(() => setStep("success"), 2000);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // Clear previous box and focus it
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        codeInputRefs.current[index - 1]?.focus();
      } else if (code[index]) {
        // Clear current box
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{1,6}$/.test(pastedData)) return; // Allow up to 6 digits
    
    const pastedDigits = pastedData.slice(0, 6).split('');
    const newCode = [...code];
    
    pastedDigits.forEach((digit, idx) => {
      newCode[idx] = digit;
    });
    
    setCode(newCode);
    
    // Focus next available slot
    const nextFocusIndex = Math.min(pastedDigits.length, 5);
    codeInputRefs.current[nextFocusIndex]?.focus();
    
    // If fully filled, verify immediately
    if (newCode.every(d => d !== "")) {
      verifyOTP(newCode.join(''));
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post('/auth/send-otp', { email: formData.email, type: 'login' });
      setResendTimer(60);
      toast.success('OTP resent successfully');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#000', position: 'relative' }}>
      {/* Background Canvas Layer */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {initialCanvasVisible && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <CanvasRevealEffect
              animationSpeed={3}
              containerClassName="bg-black"
              colors={[[255, 255, 255], [255, 255, 255]]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}
        {reverseCanvasVisible && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <CanvasRevealEffect
              animationSpeed={4}
              containerClassName="bg-black"
              colors={[[255, 255, 255], [255, 255, 255]]}
              dotSize={6}
              reverse={true}
            />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '33%', background: 'linear-gradient(to bottom, #000, transparent)' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Top Nav */}
        <header style={{
          position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1.5rem', borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,15,15,0.6)',
          backdropFilter: 'blur(12px)', zIndex: 50, gap: '2rem',
          width: 'min(calc(100% - 2rem), 700px)'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>P</span>
            PromoSecure
          </Link>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            {[['/', 'Home'], ['/plans', 'Pricing'], ['/blog', 'Blog']].map(([href, label]) => (
              <Link key={href} to={href} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                {label}
              </Link>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/plans" style={{ padding: '0.4rem 1rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.8rem', transition: 'all 0.2s' }}>
              Get Pro
            </Link>
          </div>
        </header>

        {/* Main Form Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 1rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: '22rem' }}>
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Auth ── */}
              {step === "auth" && (
                <motion.div
                  key="auth-step"
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.1, margin: '0 0 0.5rem' }}>
                      {isAdminRegister ? 'Create Admin' : 'Welcome Back'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 300, margin: 0 }}>
                      {isAdminRegister ? 'Setup your workspace' : 'Sign in to PromoSecure'}
                    </p>
                  </div>

                  {/* Method Toggle (OTP vs Password) */}
                  {!isAdminRegister && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', padding: '0.25rem' }}>
                      {[['otp', 'Email OTP'], ['password', 'Password']].map(([m, label]) => (
                        <button key={m} onClick={() => setLoginMethod(m)} style={{
                          flex: 1, padding: '0.5rem', borderRadius: '9999px', border: 'none',
                          background: loginMethod === m ? 'white' : 'transparent',
                          color: loginMethod === m ? '#000' : 'rgba(255,255,255,0.5)',
                          fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                        }}>{label}</button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                    {isAdminRegister && (
                      <>
                        <input type="text" placeholder="Full Name" value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          style={inputStyle} required />
                        <input type="password" placeholder="Setup Key" value={formData.setupKey}
                          onChange={e => setFormData({ ...formData, setupKey: e.target.value })}
                          style={inputStyle} required />
                      </>
                    )}

                    <div style={{ position: 'relative' }}>
                      <input type="email" placeholder="your@email.com" value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ ...inputStyle, paddingRight: loginMethod === 'otp' && !isAdminRegister ? '3.5rem' : '1.25rem', textAlign: 'center' }}
                        required />
                      {loginMethod === 'otp' && !isAdminRegister && (
                        <button type="submit" disabled={loading} style={{
                          position: 'absolute', right: '0.375rem', top: '50%', transform: 'translateY(-50%)',
                          width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s'
                        }}>
                          {loading ? '…' : '→'}
                        </button>
                      )}
                    </div>

                    {(loginMethod === 'password' || isAdminRegister) && (
                      <>
                        <input type="password" placeholder="Password" value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          style={inputStyle} required />
                        {isAdminRegister && (
                          <input type="password" placeholder="Confirm Password" value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            style={inputStyle} required />
                        )}
                        <button type="submit" disabled={loading} style={{
                          width: '100%', padding: '0.75rem', borderRadius: '9999px',
                          background: 'white', color: '#000', fontWeight: 700,
                          fontSize: '0.95rem', border: 'none', cursor: 'pointer',
                          transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1
                        }}>
                          {loading ? 'Processing...' : (isAdminRegister ? 'Create Account' : 'Sign In')}
                        </button>
                      </>
                    )}
                  </form>

                  {/* Admin setup link */}
                  {(!adminExists || isAdminRegister) && (
                    <div style={{ marginTop: '1rem' }}>
                      <button onClick={() => setIsAdminRegister(!isAdminRegister)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                        {isAdminRegister ? 'Back to Login' : 'First time? Setup Admin'}
                      </button>
                    </div>
                  )}

                  <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                    By signing in, you agree to our{' '}
                    <Link to="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Terms</Link>,{' '}
                    <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Privacy Policy</Link>, and{' '}
                    <Link to="/plans" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Usage Terms</Link>.
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: OTP Code ── */}
              {step === "code" && (
                <motion.div
                  key="code-step"
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 80 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.1, margin: '0 0 0.5rem' }}>
                      Check your email
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0 }}>
                      We sent a 6-digit code to<br />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{formData.email}</span>
                    </p>
                  </div>

                  {/* OTP Input Row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)', borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1.25rem',
                    marginBottom: '1.5rem'
                  }}>
                    {code.map((digit, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          position: 'relative',
                          width: '2.5rem',
                          height: '3.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderBottom: focusedIndex === i ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
                          transition: 'border-color 0.25s ease'
                        }}>
                          <input
                            ref={el => { codeInputRefs.current[i] = el; }}
                            type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
                            value={digit}
                            onChange={e => handleCodeChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            onFocus={() => setFocusedIndex(i)}
                            onBlur={() => setFocusedIndex(-1)}
                            disabled={loading}
                            style={{
                              width: '100%',
                              height: '100%',
                              textAlign: 'center',
                              fontSize: '1.4rem',
                              background: 'transparent',
                              color: 'white',
                              border: 'none',
                              outline: 'none',
                              caretColor: 'white',
                              fontWeight: 700,
                              boxSizing: 'border-box'
                            }}
                          />
                          {!digit && (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                              <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.4rem' }}>○</span>
                            </div>
                          )}
                        </div>
                        {i < 5 && <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.2rem', margin: '0 0.15rem' }}>|</span>}
                      </div>
                    ))}
                  </div>

                  <button onClick={handleResendOTP} style={{
                    background: 'none', border: 'none', marginBottom: '1.5rem',
                    color: resendTimer > 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)',
                    cursor: resendTimer > 0 ? 'default' : 'pointer', fontSize: '0.85rem',
                    transition: 'color 0.2s'
                  }}>
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                  </button>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => { setStep("auth"); setCode(["","","","","",""]); }}
                      disabled={loading}
                      style={{ flex: '0 0 30%', padding: '0.75rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                      Back
                    </button>
                    <button
                      disabled={!code.every(d => d !== "") || loading}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: '9999px', border: 'none',
                        background: code.every(d => d !== "") ? 'white' : 'rgba(255,255,255,0.08)',
                        color: code.every(d => d !== "") ? '#000' : 'rgba(255,255,255,0.3)',
                        fontWeight: 700, cursor: code.every(d => d !== "") ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s'
                      }}>
                      {loading ? 'Verifying...' : 'Continue'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Success ── */}
              {step === "success" && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  style={{ textAlign: 'center' }}
                >
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
                    style={{ marginBottom: '2rem' }}
                  >
                    <div style={{
                      width: '5rem', height: '5rem', borderRadius: '50%',
                      background: 'linear-gradient(135deg, white, rgba(255,255,255,0.7))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}>
                      <svg style={{ width: '2.5rem', height: '2.5rem', color: '#000' }} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>You're in!</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 300, margin: 0 }}>Welcome to PromoSecure</p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                    onClick={() => redirectToDashboard(user?.role)}
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '9999px', background: 'white', color: '#000', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  >
                    Continue to Dashboard →
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white',
  borderRadius: '9999px',
  padding: '0.75rem 1.25rem',
  outline: 'none',
  fontSize: '0.95rem',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export default Login;
