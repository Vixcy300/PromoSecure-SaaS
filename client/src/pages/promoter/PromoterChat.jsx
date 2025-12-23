import { useState } from 'react';
import { HiChat } from 'react-icons/hi';

const PromoterChat = () => {
    // Static "Under Development" page - logic removed to prevent "No Manager Found" error
    return (
        <div className="page">
            <div className="page-header">
                <h1><HiChat style={{ color: 'var(--brand-primary)' }} /> Messages</h1>
            </div>

            <div className="card flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '400px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--primary-50)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <HiChat size={40} style={{ color: 'var(--brand-primary)' }} />
                </div>

                <h2 className="mb-1">Feature Under Development</h2>
                <p className="text-muted" style={{ maxWidth: '400px' }}>
                    The messaging system is currently being upgraded to provide a better experience.
                    Please contact your manager directly via email or phone for now.
                </p>

                <div className="mt-2 text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Coming Soon
                </div>
            </div>
        </div>
    );
};

export default PromoterChat;
