import { useState, useEffect } from 'react';
import { HiUserGroup, HiTrash, HiBan, HiCheck } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminPromoters = () => {
    const [promoters, setPromoters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPromoters();
    }, []);

    const fetchPromoters = async () => {
        try {
            const res = await api.get('/users?role=promoter');
            setPromoters(res.data.users);
        } catch (error) {
            toast.error('Failed to load promoters');
        } finally {
            setLoading(false);
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

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this promoter?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('Promoter deleted');
            fetchPromoters();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    return (
        <div className="page">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>
                        <HiUserGroup style={{ color: 'var(--accent-primary)' }} />
                        Manage Promoters
                    </h1>
                    <p>View and manage promoter accounts created by managers</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center mt-3">
                    <div className="spinner"></div>
                </div>
            ) : promoters.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No Promoters Yet</h3>
                    <p className="text-muted">Managers haven't created any promoters yet.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Promoter</th>
                                <th>Created By (Manager)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promoters.map((promoter) => (
                                <tr key={promoter._id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="user-avatar-sm">{promoter.name[0]}</div>
                                            <div>
                                                <div className="font-bold">{promoter.name}</div>
                                                <div className="text-sm text-muted">{promoter.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {promoter.createdBy ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium">{promoter.createdBy.name}</span>
                                                <span className="text-xs text-muted">{promoter.createdBy.email}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted italic">Unknown</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${promoter.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                                            {promoter.isActive ? 'Active' : 'Banned'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button
                                                className={`btn btn-icon ${promoter.isActive ? 'btn-ghost' : 'btn-success'}`}
                                                onClick={() => handleToggle(promoter._id)}
                                                title={promoter.isActive ? 'Ban Account' : 'Activate Account'}
                                            >
                                                {promoter.isActive ? <HiBan /> : <HiCheck />}
                                            </button>
                                            <button
                                                className="btn btn-icon btn-ghost"
                                                onClick={() => handleDelete(promoter._id)}
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

            <style>{`
        .user-avatar-sm {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--brand-gradient);
          color: white;
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

export default AdminPromoters;
