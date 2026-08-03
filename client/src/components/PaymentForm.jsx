import React, { useState } from 'react';
import { SiGooglepay, SiPhonepe, SiPaytm } from 'react-icons/si';
import { HiLockClosed, HiQrcode } from 'react-icons/hi';

export default function PaymentForm({ amount, onSubmit, onCancel, submitting }) {
    const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card'
    const [upiMethod, setUpiMethod] = useState(null);
    const [upiId, setUpiId] = useState('');

    const upiApps = [
        { id: 'gpay', label: 'GPay', icon: <SiGooglepay size={26} color="#4285f4" />, color: '#e8f0fe' },
        { id: 'phonepe', label: 'PhonePe', icon: <SiPhonepe size={22} color="#5f259f" />, color: '#f3e8ff' },
        { id: 'paytm', label: 'Paytm', icon: <SiPaytm size={22} color="#00baf2" />, color: '#e0f7fe' },
        { id: 'upi', label: 'UPI ID', icon: <HiQrcode size={22} color="#ff6b00" />, color: '#fff3e0' },
    ];

    const handleUpiSubmit = (e) => {
        e.preventDefault();
        if (upiMethod === 'upi' && !upiId.trim()) {
            return;
        }
        onSubmit(e);
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Tab Switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-tertiary, #f5f5f5)', borderRadius: '12px', padding: '0.25rem' }}>
                {[['upi', '📱 UPI / Wallet'], ['card', '💳 Debit / Credit Card']].map(([tab, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        flex: 1, padding: '0.6rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: activeTab === tab ? 'var(--bg-card, white)' : 'transparent',
                        color: activeTab === tab ? 'var(--text-primary, #212121)' : 'var(--text-muted, #9e9e9e)',
                        fontWeight: 600, fontSize: '0.8rem',
                        boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                    }}>{label}</button>
                ))}
            </div>

            {/* ── UPI Tab ── */}
            {activeTab === 'upi' && (
                <form onSubmit={handleUpiSubmit}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
                        Select your preferred UPI app
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        {upiApps.map(app => (
                            <button key={app.id} type="button" onClick={() => setUpiMethod(app.id)} style={{
                                padding: '0.875rem 0.75rem', borderRadius: '12px',
                                border: `2px solid ${upiMethod === app.id ? 'var(--brand-primary, #0066cc)' : 'var(--border-color, #e0e0e0)'}`,
                                background: upiMethod === app.id ? 'var(--brand-light, rgba(0,102,204,0.15))' : 'var(--bg-card, white)',
                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
                                boxShadow: upiMethod === app.id ? '0 0 0 3px rgba(0,102,204,0.15)' : 'none'
                            }}>
                                {app.icon}
                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{app.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* UPI ID input (only for manual UPI) */}
                    {upiMethod === 'upi' && (
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                Enter UPI ID
                            </label>
                            <input
                                type="text" placeholder="yourname@upi"
                                value={upiId} onChange={e => setUpiId(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                                    border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.9rem',
                                    background: 'var(--bg-card, white)', color: 'var(--text-primary)', outline: 'none',
                                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                                }}
                                required
                            />
                        </div>
                    )}

                    {/* Redirect message for app-based UPI */}
                    {upiMethod && upiMethod !== 'upi' && (
                        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '10px', padding: '0.875rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                                You'll be redirected to <strong style={{ color: 'var(--text-primary)' }}>{upiApps.find(a => a.id === upiMethod)?.label}</strong> to complete payment
                            </p>
                        </div>
                    )}

                    <PayActions amount={amount} onCancel={onCancel} submitting={submitting} disabled={!upiMethod} />
                </form>
            )}

            {/* ── Card Tab ── */}
            {activeTab === 'card' && (
                <form onSubmit={onSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Cardholder Name</label>
                        <input type="text" placeholder="As printed on card" name="cardholderName" style={cardInputStyle} required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Card Number</label>
                        <input type="text" placeholder="0000  0000  0000  0000" name="cardNumber" inputMode="numeric" maxLength={19} style={cardInputStyle} required />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Expiry</label>
                            <input type="text" placeholder="MM / YY" name="expiryDate" style={cardInputStyle} required />
                        </div>
                        <div style={{ flex: '0 0 40%' }}>
                            <label style={labelStyle}>CVV</label>
                            <input type="password" placeholder="•••" name="cvv" maxLength={4} style={cardInputStyle} required />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', background: 'var(--success-bg, #e8f5e9)', borderRadius: '10px' }}>
                        <HiLockClosed style={{ color: 'var(--success, #2e7d32)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--success, #2e7d32)' }}>
                            Secured with 256-bit SSL encryption. Card details are never stored.
                        </span>
                    </div>
                    <PayActions amount={amount} onCancel={onCancel} submitting={submitting} />
                </form>
            )}
        </div>
    );
}

function PayActions({ amount, onCancel, submitting, disabled }) {
    return (
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onCancel} style={{
                flex: '0 0 30%', padding: '0.75rem', borderRadius: '10px',
                background: 'transparent', border: '1px solid var(--border-color)', cursor: 'pointer',
                color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', transition: 'background 0.2s'
            }}>
                Cancel
            </button>
            <button type="submit" disabled={submitting || disabled} style={{
                flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: submitting || disabled ? 'not-allowed' : 'pointer',
                background: 'var(--brand-primary, #0066cc)', color: 'white',
                fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.2s',
                opacity: submitting || disabled ? 0.65 : 1
            }}>
                {submitting ? 'Processing...' : `Pay ${amount}`}
            </button>
        </div>
    );
}

const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '0.4rem'
};

const cardInputStyle = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
    border: '1px solid var(--border-color, #e0e0e0)', fontSize: '0.9rem',
    background: 'var(--bg-card, white)', color: 'var(--text-primary)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'var(--font-sans)'
};
