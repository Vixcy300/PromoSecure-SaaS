import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiUsers, HiCollection, HiPhotograph, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ promoters: 0, batches: [], pending: 0 });
    const [recentBatches, setRecentBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [usersRes, batchesRes] = await Promise.all([
                api.get('/users'),
                api.get('/batches'),
            ]);

            const pending = batchesRes.data.batches.filter(b => b.status === 'pending').length;

            setStats({
                promoters: usersRes.data.count,
                batches: batchesRes.data.batches,
                pending,
            });
            setRecentBatches(batchesRes.data.batches.slice(0, 5));
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
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
            <div className="page-header">
                <h1>
                    <HiUsers style={{ color: 'var(--accent-primary)' }} />
                    Manager Dashboard
                </h1>
                <p>Welcome back, {user?.name}! {user?.companyName && `(${user.companyName})`}</p>
            </div>

            <div className="grid grid-3">
                <div className="card stat-card">
                    <div className="stat-icon green">
                        <HiUsers />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.promoters}</h3>
                        <p>Promoters ({user?.promotersCreated}/{user?.promoterLimit})</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon blue">
                        <HiCollection />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.batches.length}</h3>
                        <p>Total Batches</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon yellow">
                        <HiClock />
                    </div>
                    <div className="stat-content">
                        <h3>{stats.pending}</h3>
                        <p>Pending Review</p>
                    </div>
                </div>
            </div>

            <div className="card mt-3">
                <div className="flex justify-between items-center mb-2">
                    <h3>Recent Batches</h3>
                    <Link to="/manager/batches" className="btn btn-ghost">View All</Link>
                </div>

                {recentBatches.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3>No Batches Yet</h3>
                        <p className="text-muted">Batches will appear here when your promoters submit them</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Batch</th>
                                    <th>Promoter</th>
                                    <th>Photos</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBatches.map((batch) => (
                                    <tr key={batch._id}>
                                        <td>
                                            <Link to={`/manager/batches/${batch._id}`} className="font-bold">
                                                {batch.title}
                                            </Link>
                                        </td>
                                        <td>{batch.promoter?.name}</td>
                                        <td>{batch.photoCount}</td>
                                        <td>
                                            <span className={`badge badge-${batch.status}`}>{batch.status}</span>
                                        </td>
                                        <td className="text-muted text-sm">
                                            {batch.submittedAt ? new Date(batch.submittedAt).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
