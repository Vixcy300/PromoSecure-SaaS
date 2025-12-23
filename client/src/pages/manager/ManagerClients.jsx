import { useState, useEffect } from 'react';
import { HiBriefcase, HiPlus, HiPencil, HiTrash, HiX } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManagerClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        industry: '',
        notes: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data.clients);
        } catch (error) {
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            contactPerson: '',
            contactEmail: '',
            contactPhone: '',
            industry: '',
            notes: ''
        });
        setEditingClient(null);
    };

    const openModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name,
                contactPerson: client.contactPerson || '',
                contactEmail: client.contactEmail || '',
                contactPhone: client.contactPhone || '',
                industry: client.industry || '',
                notes: client.notes || ''
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Client name is required');
            return;
        }

        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient._id}`, formData);
                toast.success('Client updated');
            } else {
                await api.post('/clients', formData);
                toast.success('Client created');
            }
            closeModal();
            fetchClients();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save client');
        }
    };

    const handleDelete = async (client) => {
        if (!confirm(`Delete client "${client.name}"?`)) return;

        try {
            await api.delete(`/clients/${client._id}`);
            toast.success('Client deleted');
            fetchClients();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete client');
        }
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>
                        <HiBriefcase style={{ color: 'var(--brand-primary)' }} />
                        Clients
                    </h1>
                    <p>Manage your client brands and contacts</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <HiPlus /> Add Client
                </button>
            </div>

            {clients.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <h3>No Clients Yet</h3>
                    <p className="text-muted">Add your first client to start organizing batches by brand</p>
                    <button className="btn btn-primary mt-2" onClick={() => openModal()}>
                        <HiPlus /> Add First Client
                    </button>
                </div>
            ) : (
                <div className="grid grid-3">
                    {clients.map(client => (
                        <div key={client._id} className="card client-card">
                            <div className="client-header">
                                <div className="client-avatar">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="client-info">
                                    <h4>{client.name}</h4>
                                    {client.industry && (
                                        <span className="text-sm text-muted">{client.industry}</span>
                                    )}
                                </div>
                            </div>

                            {client.contactPerson && (
                                <div className="client-detail">
                                    <span className="label">Contact:</span>
                                    <span>{client.contactPerson}</span>
                                </div>
                            )}
                            {client.contactEmail && (
                                <div className="client-detail">
                                    <span className="label">Email:</span>
                                    <span>{client.contactEmail}</span>
                                </div>
                            )}

                            <div className="client-actions">
                                <button className="btn btn-ghost" onClick={() => openModal(client)}>
                                    <HiPencil /> Edit
                                </button>
                                <button className="btn btn-ghost text-danger" onClick={() => handleDelete(client)}>
                                    <HiTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label>Client Name *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Coca-Cola"
                                        required
                                    />
                                </div>
                                <div className="grid grid-2">
                                    <div className="input-group">
                                        <label>Contact Person</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.contactPerson}
                                            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Industry</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.industry}
                                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                            placeholder="FMCG, Retail, etc."
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-2">
                                    <div className="input-group">
                                        <label>Contact Email</label>
                                        <input
                                            type="email"
                                            className="input"
                                            value={formData.contactEmail}
                                            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                            placeholder="contact@brand.com"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Contact Phone</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.contactPhone}
                                            onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Notes</label>
                                    <textarea
                                        className="input"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Any additional notes about this client..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingClient ? 'Save Changes' : 'Add Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .client-card {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .client-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .client-avatar {
                    width: 48px;
                    height: 48px;
                    background: var(--brand-gradient);
                    color: white;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .client-info h4 {
                    margin: 0;
                }

                .client-detail {
                    display: flex;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .client-detail .label {
                    color: var(--text-muted);
                }

                .client-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: auto;
                    padding-top: 0.5rem;
                    border-top: 1px solid var(--border-color);
                }

                .text-danger {
                    color: var(--error) !important;
                }
            `}</style>
        </div>
    );
};

export default ManagerClients;
