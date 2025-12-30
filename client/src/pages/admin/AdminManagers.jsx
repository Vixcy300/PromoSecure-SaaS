import { useState, useEffect } from 'react';
import { HiPlus, HiOfficeBuilding, HiPencil, HiTrash, HiX, HiBan, HiCheck } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminManagers = () => {
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLimit, setEditingLimit] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        companyName: '',
        companyName: '',
        promoterLimit: 5,
        otp: ''
    });
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            const res = await api.get('/users?role=manager');
            setManagers(res.data.users);
        } catch (error) {
            toast.error('Failed to load managers');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/manager', formData);
            toast.success('Manager created successfully');
            setShowModal(false);
            setFormData({ email: '', password: '', name: '', companyName: '', promoterLimit: 5, otp: '' });
            setOtpSent(false);
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create manager');
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
            fetchManagers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleUpdateLimit = async (id) => {
        try {
            await api.put(`/users/${id}/limit`, { promoterLimit: editingLimit.value });
            toast.success('Limit updated');
            setEditingLimit(null);
            fetchManagers();
        } catch (error) {
            toast.error('Failed to update limit');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this manager?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('Manager deleted');
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <div className="page">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>
                        <HiOfficeBuilding style={{ color: 'var(--accent-primary)' }} />
                        Manage Managers
                    </h1>
                    <p>Create and manage manager accounts</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiPlus />
                    Add Manager
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center mt-3">
                    <div className="spinner"></div>
                </div>
            ) : managers.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <h3>No Managers Yet</h3>
                    <p className="text-muted">Create your first manager account to get started</p>
                    <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
                        <HiPlus /> Add Manager
                    </button>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Manager</th>
                                <th>Company</th>
                                <th>Promoters</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managers.map((manager) => (
                                <tr key={manager._id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="user-avatar-sm">{manager.name[0]}</div>
                                            <div>
                                                <div className="font-bold">{manager.name}</div>
                                                <div className="text-sm text-muted">{manager.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{manager.companyName || '—'}</td>
                                    <td>
                                        {editingLimit?.id === manager._id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    className="input"
                                                    style={{ width: 60, padding: '0.5rem' }}
                                                    value={editingLimit.value}
                                                    onChange={(e) => setEditingLimit({ ...editingLimit, value: e.target.value })}
                                                    min="0"
                                                />
                                                <button className="btn btn-icon btn-success" onClick={() => handleUpdateLimit(manager._id)}>
                                                    <HiCheck />
                                                </button>
                                                <button className="btn btn-icon btn-ghost" onClick={() => setEditingLimit(null)}>
                                                    <HiX />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <span>{manager.promotersCreated} / {manager.promoterLimit}</span>
                                                <button
                                                    className="btn btn-icon btn-ghost"
                                                    onClick={() => setEditingLimit({ id: manager._id, value: manager.promoterLimit })}
                                                >
                                                    <HiPencil />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${manager.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                                            {manager.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button
                                                className={`btn btn-icon ${manager.isActive ? 'btn-ghost' : 'btn-success'}`}
                                                onClick={() => handleToggle(manager._id)}
                                                title={manager.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {manager.isActive ? <HiBan /> : <HiCheck />}
                                            </button>
                                            <button
                                                className="btn btn-icon btn-ghost"
                                                onClick={() => handleDelete(manager._id)}
                                                title="Delete"
                                            >
                                                <HiTrash style={{ color: 'var(--error)' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Manager</h3>
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
                                <div className="input-group">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Promoter Account Limit</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.promoterLimit}
                                        onChange={(e) => setFormData({ ...formData, promoterLimit: parseInt(e.target.value) })}
                                        min="1"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={!otpSent || !formData.otp}>
                                    Create Manager
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .user-avatar-sm {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
};

export default AdminManagers;
