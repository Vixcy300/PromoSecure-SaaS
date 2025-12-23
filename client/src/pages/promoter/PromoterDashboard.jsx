import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiCamera, HiPaperAirplane, HiTrash, HiX, HiBriefcase } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PromoterDashboard = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        client: '', // Client ID
    });

    useEffect(() => {
        fetchBatches();
        fetchClients();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data.batches);
        } catch (error) {
            toast.error('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data.clients || []);
        } catch (error) {
            // Silently fail if no clients access (promoter may not have client list)
            console.log('Clients not available');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
            };
            // Only include client if selected
            if (formData.client) {
                payload.client = formData.client;
            }
            const res = await api.post('/batches', payload);
            toast.success('Batch created! Start adding photos.');
            setShowModal(false);
            setFormData({ title: '', description: '', location: '', client: '' });
            navigate(`/promoter/batch/${res.data.batch._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create batch');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this batch?')) return;
        try {
            await api.delete(`/batches/${id}`);
            toast.success('Batch deleted');
            fetchBatches();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft': return '📝';
            case 'pending': return '⏳';
            case 'approved': return '✅';
            case 'rejected': return '❌';
            default: return '📦';
        }
    };

    return (
        <div className="page">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>
                        <HiCamera style={{ color: 'var(--accent-primary)' }} />
                        My Batches
                    </h1>
                    <p>Create batches and capture photos for verification</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <HiPlus />
                    New Batch
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center mt-3">
                    <div className="spinner"></div>
                </div>
            ) : batches.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📸</div>
                    <h3>No Batches Yet</h3>
                    <p className="text-muted">Create your first batch to start capturing photos</p>
                    <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
                        <HiPlus /> Create First Batch
                    </button>
                </div>
            ) : (
                <div className="grid grid-3">
                    {batches.map((batch) => (
                        <div
                            key={batch._id}
                            className="card batch-card"
                            onClick={() => navigate(`/promoter/batch/${batch._id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="batch-card-header">
                                <span className="batch-icon">{getStatusIcon(batch.status)}</span>
                                <span className={`badge badge-${batch.status}`}>{batch.status}</span>
                            </div>
                            <h4>{batch.title}</h4>
                            {batch.client && (
                                <div className="client-tag">
                                    <HiBriefcase /> {batch.client.name || 'Client'}
                                </div>
                            )}
                            <p className="text-sm text-muted">{batch.description || 'No description'}</p>
                            <div className="batch-card-footer">
                                <span className="photo-count">
                                    <HiCamera /> {batch.photoCount} photos
                                </span>
                                {batch.status === 'draft' && (
                                    <button
                                        className="btn btn-icon btn-ghost"
                                        onClick={(e) => handleDelete(batch._id, e)}
                                    >
                                        <HiTrash style={{ color: 'var(--error)' }} />
                                    </button>
                                )}
                            </div>
                            {batch.reviewNote && (
                                <div className="review-note">
                                    <span className="text-sm">
                                        {batch.status === 'rejected' ? '❌' : '✅'} {batch.reviewNote}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Batch</h3>
                            <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body flex flex-col gap-2">
                                {clients.length > 0 && (
                                    <div className="input-group">
                                        <label>Client/Brand</label>
                                        <select
                                            className="input"
                                            value={formData.client}
                                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                        >
                                            <option value="">-- Select Client (Optional) --</option>
                                            {clients.map(client => (
                                                <option key={client._id} value={client._id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="input-group">
                                    <label>Batch Title *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., Mall Campaign Day 1"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Description</label>
                                    <textarea
                                        className="input"
                                        placeholder="Brief description of this batch..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g., City Mall, Main Street"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create & Start Capturing
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .batch-card {
          transition: all var(--transition-normal);
        }

        .batch-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .batch-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .batch-icon {
          font-size: 1.5rem;
        }

        .batch-card h4 {
          margin-bottom: 0.25rem;
        }

        .batch-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .photo-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
        }

        .review-note {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-sm);
        }

        .client-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--brand-primary);
          background: var(--brand-soft);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          margin-bottom: 0.5rem;
        }
      `}</style>
        </div>
    );
};

export default PromoterDashboard;
