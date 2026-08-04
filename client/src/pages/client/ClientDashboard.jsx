import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import { useNavigate } from 'react-router-dom';
import { HiBriefcase, HiCamera, HiCheckCircle } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data.batches);
        } catch (error) {
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalCampaigns: batches.length,
        totalPhotos: batches.reduce((sum, b) => sum + (b.photoCount || 0), 0),
        approvedCampaigns: batches.filter(b => b.status === 'approved').length
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>
                    <HiBriefcase style={{ color: 'var(--brand-primary)' }} />
                    Client Portal
                </h1>
                <p>Welcome to your real-time campaign verification portal.</p>
            </div>

            <div className="grid grid-3 mb-2">
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        <HiBriefcase />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalCampaigns}</h3>
                        <p>Total Campaigns</p>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                        <HiCheckCircle />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.approvedCampaigns}</h3>
                        <p>Approved Campaigns</p>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}>
                        <HiCamera />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalPhotos}</h3>
                        <p>Verified Photos</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="mb-2">Your Campaigns</h2>
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Spinner size={24} />
                    </div>
                ) : batches.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <h3>No Campaigns Found</h3>
                        <p className="text-muted">You currently do not have any active or completed campaigns to view.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Campaign Title</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Photos</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((batch) => (
                                    <tr 
                                        key={batch._id} 
                                        onClick={() => navigate(`/manager/batches/${batch._id}`)} 
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td><strong>{batch.title}</strong></td>
                                        <td>{batch.location || 'N/A'}</td>
                                        <td>
                                            <span className={`badge badge-${batch.status}`}>
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td>{batch.photoCount || 0}</td>
                                        <td>{new Date(batch.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .stat-content h3 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                .stat-content p {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }
                tr:hover {
                    background-color: var(--bg-tertiary);
                }
            `}</style>
        </div>
    );
};

export default ClientDashboard;
