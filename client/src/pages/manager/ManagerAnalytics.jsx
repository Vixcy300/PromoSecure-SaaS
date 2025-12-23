import { useState, useEffect } from 'react';
import { HiChartBar, HiTrendingUp, HiUsers, HiCamera, HiCalendar } from 'react-icons/hi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

const ManagerAnalytics = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // days

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data.batches || []);
        } catch (error) {
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate analytics
    const analytics = {
        totalBatches: batches.length,
        totalPhotos: batches.reduce((sum, b) => sum + (b.photoCount || 0), 0),
        approved: batches.filter(b => b.status === 'approved').length,
        pending: batches.filter(b => b.status === 'pending').length,
        rejected: batches.filter(b => b.status === 'rejected').length,
        draft: batches.filter(b => b.status === 'draft').length,
    };

    // Promoter performance
    const promoterStats = {};
    batches.forEach(b => {
        const name = b.promoter?.name || 'Unknown';
        if (!promoterStats[name]) {
            promoterStats[name] = { batches: 0, photos: 0, approved: 0 };
        }
        promoterStats[name].batches++;
        promoterStats[name].photos += b.photoCount || 0;
        if (b.status === 'approved') promoterStats[name].approved++;
    });

    const promoterLeaderboard = Object.entries(promoterStats)
        .map(([name, stats]) => ({
            name,
            ...stats,
            approvalRate: stats.batches > 0 ? Math.round((stats.approved / stats.batches) * 100) : 0
        }))
        .sort((a, b) => b.photos - a.photos);

    // Client distribution
    const clientStats = {};
    batches.forEach(b => {
        const name = b.client?.name || 'Unassigned';
        if (!clientStats[name]) {
            clientStats[name] = { batches: 0, photos: 0 };
        }
        clientStats[name].batches++;
        clientStats[name].photos += b.photoCount || 0;
    });

    // Daily submissions (last 30 days)
    const today = new Date();
    const dailyData = {};
    for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        dailyData[key] = { batches: 0, photos: 0 };
    }

    batches.forEach(b => {
        const date = new Date(b.createdAt).toISOString().split('T')[0];
        if (dailyData[date]) {
            dailyData[date].batches++;
            dailyData[date].photos += b.photoCount || 0;
        }
    });

    // Chart data
    const submissionChartData = {
        labels: Object.keys(dailyData).map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Photos',
                data: Object.values(dailyData).map(d => d.photos),
                borderColor: 'rgb(13, 148, 136)',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Batches',
                data: Object.values(dailyData).map(d => d.batches),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ],
    };

    const statusChartData = {
        labels: ['Approved', 'Pending', 'Rejected', 'Draft'],
        datasets: [{
            data: [analytics.approved, analytics.pending, analytics.rejected, analytics.draft],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#64748b'],
            borderWidth: 0,
        }],
    };

    const clientChartData = {
        labels: Object.keys(clientStats).slice(0, 5),
        datasets: [{
            label: 'Photos',
            data: Object.values(clientStats).slice(0, 5).map(c => c.photos),
            backgroundColor: 'rgba(13, 148, 136, 0.8)',
            borderRadius: 8,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
            },
            x: {
                grid: { display: false },
            },
        },
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
                    <HiChartBar style={{ color: 'var(--brand-primary)' }} />
                    Analytics
                </h1>
                <p>Track performance and insights across your campaigns</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-4 mb-2">
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}>
                        <HiCamera />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{analytics.totalPhotos}</span>
                        <span className="stat-label">Total Photos</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <HiTrendingUp />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{analytics.totalBatches}</span>
                        <span className="stat-label">Total Batches</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                        <HiChartBar />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">
                            {analytics.totalBatches > 0
                                ? Math.round((analytics.approved / analytics.totalBatches) * 100)
                                : 0}%
                        </span>
                        <span className="stat-label">Approval Rate</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <HiUsers />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{promoterLeaderboard.length}</span>
                        <span className="stat-label">Active Promoters</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-2 mb-2">
                {/* Submission Trends */}
                <div className="card">
                    <div className="card-header">
                        <h3>📈 Submission Trends</h3>
                        <select
                            className="input"
                            style={{ width: 'auto' }}
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="14">Last 14 days</option>
                            <option value="30">Last 30 days</option>
                        </select>
                    </div>
                    <div className="chart-container">
                        <Line data={submissionChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="card">
                    <h3 className="mb-2">📊 Batch Status</h3>
                    <div className="chart-container-sm">
                        <Doughnut
                            data={statusChartData}
                            options={{
                                ...chartOptions,
                                cutout: '60%',
                            }}
                        />
                    </div>
                    <div className="status-legend">
                        <span><span className="dot" style={{ background: '#22c55e' }}></span> Approved: {analytics.approved}</span>
                        <span><span className="dot" style={{ background: '#f59e0b' }}></span> Pending: {analytics.pending}</span>
                        <span><span className="dot" style={{ background: '#ef4444' }}></span> Rejected: {analytics.rejected}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-2">
                {/* Client Performance */}
                <div className="card">
                    <h3 className="mb-2">🏢 Photos by Client</h3>
                    <div className="chart-container">
                        <Bar data={clientChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Promoter Leaderboard */}
                <div className="card">
                    <h3 className="mb-2">🏆 Promoter Leaderboard</h3>
                    <div className="leaderboard">
                        {promoterLeaderboard.slice(0, 5).map((promoter, index) => (
                            <div key={promoter.name} className="leaderboard-item">
                                <div className="leaderboard-rank">
                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                </div>
                                <div className="leaderboard-info">
                                    <strong>{promoter.name}</strong>
                                    <span className="text-muted text-sm">
                                        {promoter.photos} photos • {promoter.batches} batches
                                    </span>
                                </div>
                                <div className="leaderboard-score">
                                    <span className={`badge ${promoter.approvalRate >= 80 ? 'badge-approved' : 'badge-pending'}`}>
                                        {promoter.approvalRate}%
                                    </span>
                                </div>
                            </div>
                        ))}
                        {promoterLeaderboard.length === 0 && (
                            <p className="text-muted text-center">No promoter data yet</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .grid-4 {
                    grid-template-columns: repeat(4, 1fr);
                }

                @media (max-width: 1024px) {
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .grid-4 { grid-template-columns: 1fr; }
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .card-header h3 {
                    margin: 0;
                }

                .chart-container {
                    height: 250px;
                }

                .chart-container-sm {
                    height: 180px;
                    max-width: 180px;
                    margin: 0 auto;
                }

                .status-legend {
                    display: flex;
                    justify-content: center;
                    gap: 1.5rem;
                    margin-top: 1rem;
                    font-size: 0.85rem;
                }

                .dot {
                    display: inline-block;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 4px;
                }

                .leaderboard {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .leaderboard-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                }

                .leaderboard-rank {
                    font-size: 1.25rem;
                    min-width: 2rem;
                    text-align: center;
                }

                .leaderboard-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .leaderboard-score {
                    text-align: right;
                }
            `}</style>
        </div>
    );
};

export default ManagerAnalytics;
