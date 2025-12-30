import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiPlus, HiUsers, HiX, HiBan, HiCheck, HiTrash } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManagerPromoters = () => {
    const { user } = useAuth();
    const [promoters, setPromoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        otp: ''
    });
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        fetchPromoters();
    }, []);

    const fetchPromoters = async () => {
        try {
            const res = await api.get('/users');
            setPromoters(res.data.users);
        } catch (error) {
            toast.error('Failed to load promoters');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/promoter', formData);
            toast.success('Promoter created successfully');
            setShowModal(false);
            setFormData({ email: '', password: '', name: '', otp: '' });
            setOtpSent(false);
            fetchPromoters();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create promoter');
        }
    };

    const handleSendOTP = async () => {
        if (!formData.email) return;
        try {
            await api.post('/auth/send-otp', { email: formData.email, type: 'register' });
            setOtpSent(true);
            toast.success('OTP sent to email');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await api.put(`/users/${id}/toggle`);
            toast.success(res.data.message);
            fetchPromoters();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const canCreateMore = user?.promotersCreated < user?.promoterLimit;

    return (
        <div className="page">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>
                        <HiUsers style={{ color: 'var(--accent-primary)' }} />
                        Manage Promoters
                    </h1>
                    <p>
                        {user?.promotersCreated} of {user?.promoterLimit} promoter accounts used
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowModal(true)}
                    disabled={!canCreateMore}
                >
                    <HiPlus />
                    Add Promoter
                </button>
            </div>

            {!canCreateMore && (
                <div className="card mb-2" style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning)' }}>
                    <p style={{ color: 'var(--warning)', margin: 0 }}>
                        ⚠️ You've reached your promoter limit. Contact admin for more slots.
                    </p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center mt-3">
                    <div className="spinner"></div>
                </div>
            ) : promoters.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No Promoters Yet</h3>
                    <p className="text-muted">Create your first promoter account</p>
                    {canCreateMore && (
                        <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
                            <HiPlus /> Add Promoter
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-3">
                    {promoters.map((promoter) => (
                        <div key={promoter._id} className="card promoter-card">
                            <div className="promoter-header">
                                <div className="promoter-avatar">{promoter.name[0]}</div>
                                <div>
                                    <h4>{promoter.name}</h4>
                                    <p className="text-sm text-muted">{promoter.email}</p>
                                </div>
                            </div>
                            <div className="promoter-meta">
                                <span className={`badge ${promoter.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                                    {promoter.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-sm text-muted">
                                    Joined {new Date(promoter.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="promoter-actions">
                                <button
                                    className={`btn btn-sm ${promoter.isActive ? 'btn-ghost' : 'btn-success'}`}
                                    onClick={() => handleToggle(promoter._id)}
                                >
                                    {promoter.isActive ? <><HiBan /> Deactivate</> : <><HiCheck /> Activate</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Promoter</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body flex flex-col gap-2">
                                <div className="input-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Email *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            className="input"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            disabled={otpSent}
                                        />
                                        {!otpSent && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleSendOTP}
                                                disabled={!formData.email}
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {otpSent && (
                                    <div className="input-group">
                                        <label>Enter OTP *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.otp}
                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                            required
                                            maxLength={6}
                                            placeholder="6-digit code"
                                        />
                                    </div>
                                )}
                                <div className="input-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        className="input"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={!otpSent || !formData.otp}>
                                    Create Promoter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .promoter-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .promoter-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .promoter-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background: var(--success);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
        }

        .promoter-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .promoter-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
        }
      `}</style>
        </div>
    );
};

export default ManagerPromoters;
