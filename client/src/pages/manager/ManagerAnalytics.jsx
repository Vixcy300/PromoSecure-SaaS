import { useState, useEffect } from 'react';
import { HiChartBar, HiTrendingUp, HiTrendingDown, HiUsers, HiCamera, HiCalendar, HiLightningBolt, HiClock, HiFire } from 'react-icons/hi';
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
    const [activeTab, setActiveTab] = useState('overview'); // overview, heatmap, trends

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

    // ========== ACTIVITY HEAT GRID (Day/Hour) ==========
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
    const hourRanges = [6, 8, 10, 12, 14, 16, 18, 20];

    const activityGrid = Array(7).fill(null).map(() => Array(8).fill(0));
    batches.forEach(b => {
        const date = new Date(b.createdAt);
        const day = date.getDay(); // 0-6
        const hour = date.getHours();
        // Find which hour bucket
        for (let i = 0; i < hourRanges.length; i++) {
            if (hour >= hourRanges[i] && (i === hourRanges.length - 1 || hour < hourRanges[i + 1])) {
                activityGrid[day][i] += (b.photoCount || 1);
                break;
            }
        }
    });

    const maxActivity = Math.max(...activityGrid.flat(), 1);
    const getHeatColor = (value) => {
        if (value === 0) return 'var(--bg-tertiary)';
        const intensity = Math.min(value / maxActivity, 1);
        if (intensity < 0.25) return 'rgba(37, 99, 235, 0.2)';
        if (intensity < 0.5) return 'rgba(37, 99, 235, 0.4)';
        if (intensity < 0.75) return 'rgba(37, 99, 235, 0.6)';
        return 'rgba(37, 99, 235, 0.9)';
    };

    // ========== WEEK-OVER-WEEK COMPARISON ==========
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekBatches = batches.filter(b => new Date(b.createdAt) >= thisWeekStart);
    const lastWeekBatches = batches.filter(b => {
        const date = new Date(b.createdAt);
        return date >= lastWeekStart && date < thisWeekStart;
    });

    const thisWeekPhotos = thisWeekBatches.reduce((sum, b) => sum + (b.photoCount || 0), 0);
    const lastWeekPhotos = lastWeekBatches.reduce((sum, b) => sum + (b.photoCount || 0), 0);
    const weeklyChange = lastWeekPhotos > 0
        ? Math.round(((thisWeekPhotos - lastWeekPhotos) / lastWeekPhotos) * 100)
        : (thisWeekPhotos > 0 ? 100 : 0);

    const thisWeekApproved = thisWeekBatches.filter(b => b.status === 'approved').length;
    const lastWeekApproved = lastWeekBatches.filter(b => b.status === 'approved').length;
    const approvalChange = lastWeekApproved > 0
        ? Math.round(((thisWeekApproved - lastWeekApproved) / lastWeekApproved) * 100)
        : (thisWeekApproved > 0 ? 100 : 0);

    // ========== PERFORMANCE INSIGHTS ==========
    const avgPhotosPerBatch = analytics.totalBatches > 0
        ? Math.round(analytics.totalPhotos / analytics.totalBatches)
        : 0;

    const approvalRate = analytics.totalBatches > 0
        ? Math.round((analytics.approved / analytics.totalBatches) * 100)
        : 0;

    // Best performing day
    const dailyTotals = Array(7).fill(0);
    batches.forEach(b => {
        const day = new Date(b.createdAt).getDay();
        dailyTotals[day] += b.photoCount || 0;
    });
    const bestDayIndex = dailyTotals.indexOf(Math.max(...dailyTotals));
    const bestDay = days[bestDayIndex];

    // Best performing hour range
    const hourlyTotals = Array(8).fill(0);
    activityGrid.forEach(dayData => {
        dayData.forEach((val, i) => hourlyTotals[i] += val);
    });
    const bestHourIndex = hourlyTotals.indexOf(Math.max(...hourlyTotals));
    const bestHour = hours[bestHourIndex];

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

    // Daily submissions (last N days)
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

    const submissionChartData = {
        labels: Object.keys(dailyData).map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Photos',
                data: Object.values(dailyData).map(d => d.photos),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
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
            backgroundColor: 'rgba(37, 99, 235, 0.8)',
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
                    Advanced Analytics
                </h1>
                <p>Detailed performance insights, heat maps, and trend analysis</p>
            </div>

            {/* Tabs */}
            <div className="analytics-tabs mb-2">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'heatmap' ? 'active' : ''}`}
                    onClick={() => setActiveTab('heatmap')}
                >
                    🔥 Activity Heatmap
                </button>
                <button
                    className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trends')}
                >
                    📈 Trends & Insights
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Summary Stats */}
                    <div className="grid grid-4 mb-2">
                        <div className="stat-card card">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
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
                                <span className="stat-value">{approvalRate}%</span>
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
                </>
            )}

            {/* Activity Heatmap Tab */}
            {activeTab === 'heatmap' && (
                <div className="card">
                    <h3 className="mb-2">🔥 Activity Heat Grid</h3>
                    <p className="text-muted mb-2">Photo submissions by day and time of day</p>

                    <div className="heatmap-container">
                        <div className="heatmap-grid">
                            {/* Hour labels */}
                            <div className="heatmap-row heatmap-header">
                                <div className="heatmap-label"></div>
                                {hours.map(h => (
                                    <div key={h} className="heatmap-hour-label">{h}</div>
                                ))}
                            </div>

                            {/* Data rows */}
                            {days.map((day, dayIndex) => (
                                <div key={day} className="heatmap-row">
                                    <div className="heatmap-label">{day}</div>
                                    {activityGrid[dayIndex].map((value, hourIndex) => (
                                        <div
                                            key={hourIndex}
                                            className="heatmap-cell"
                                            style={{ backgroundColor: getHeatColor(value) }}
                                            title={`${day} ${hours[hourIndex]}: ${value} photos`}
                                        >
                                            {value > 0 && <span className="heatmap-value">{value}</span>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="heatmap-legend">
                            <span>Less</span>
                            <div className="legend-scale">
                                <div style={{ backgroundColor: 'var(--bg-tertiary)' }}></div>
                                <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)' }}></div>
                                <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.4)' }}></div>
                                <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.6)' }}></div>
                                <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.9)' }}></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    {/* Peak Activity Insights */}
                    <div className="insights-row mt-2">
                        <div className="insight-card">
                            <HiCalendar className="insight-icon" />
                            <div>
                                <span className="insight-label">Best Day</span>
                                <span className="insight-value">{bestDay}</span>
                            </div>
                        </div>
                        <div className="insight-card">
                            <HiClock className="insight-icon" />
                            <div>
                                <span className="insight-label">Peak Hours</span>
                                <span className="insight-value">{bestHour}</span>
                            </div>
                        </div>
                        <div className="insight-card">
                            <HiFire className="insight-icon" />
                            <div>
                                <span className="insight-label">Peak Activity</span>
                                <span className="insight-value">{maxActivity} photos</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Trends & Insights Tab */}
            {activeTab === 'trends' && (
                <>
                    {/* Week-over-Week Comparison */}
                    <div className="card mb-2">
                        <h3 className="mb-2">📊 Week-over-Week Comparison</h3>
                        <div className="wow-grid">
                            <div className="wow-card">
                                <div className="wow-header">
                                    <span className="wow-label">Photos This Week</span>
                                    <span className={`wow-change ${weeklyChange >= 0 ? 'positive' : 'negative'}`}>
                                        {weeklyChange >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                                        {weeklyChange >= 0 ? '+' : ''}{weeklyChange}%
                                    </span>
                                </div>
                                <div className="wow-values">
                                    <span className="wow-current">{thisWeekPhotos}</span>
                                    <span className="wow-previous">vs {lastWeekPhotos} last week</span>
                                </div>
                            </div>
                            <div className="wow-card">
                                <div className="wow-header">
                                    <span className="wow-label">Batches This Week</span>
                                    <span className={`wow-change ${thisWeekBatches.length >= lastWeekBatches.length ? 'positive' : 'negative'}`}>
                                        {thisWeekBatches.length >= lastWeekBatches.length ? <HiTrendingUp /> : <HiTrendingDown />}
                                        {thisWeekBatches.length - lastWeekBatches.length >= 0 ? '+' : ''}
                                        {thisWeekBatches.length - lastWeekBatches.length}
                                    </span>
                                </div>
                                <div className="wow-values">
                                    <span className="wow-current">{thisWeekBatches.length}</span>
                                    <span className="wow-previous">vs {lastWeekBatches.length} last week</span>
                                </div>
                            </div>
                            <div className="wow-card">
                                <div className="wow-header">
                                    <span className="wow-label">Approvals This Week</span>
                                    <span className={`wow-change ${approvalChange >= 0 ? 'positive' : 'negative'}`}>
                                        {approvalChange >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                                        {approvalChange >= 0 ? '+' : ''}{approvalChange}%
                                    </span>
                                </div>
                                <div className="wow-values">
                                    <span className="wow-current">{thisWeekApproved}</span>
                                    <span className="wow-previous">vs {lastWeekApproved} last week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Insights */}
                    <div className="card mb-2">
                        <h3 className="mb-2">💡 Performance Insights</h3>
                        <div className="insights-grid">
                            <div className="perf-insight">
                                <div className="perf-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                                    <HiCamera />
                                </div>
                                <div className="perf-content">
                                    <span className="perf-value">{avgPhotosPerBatch}</span>
                                    <span className="perf-label">Avg Photos/Batch</span>
                                </div>
                            </div>
                            <div className="perf-insight">
                                <div className="perf-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                    <HiChartBar />
                                </div>
                                <div className="perf-content">
                                    <span className="perf-value">{approvalRate}%</span>
                                    <span className="perf-label">Approval Rate</span>
                                </div>
                            </div>
                            <div className="perf-insight">
                                <div className="perf-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                    <HiCalendar />
                                </div>
                                <div className="perf-content">
                                    <span className="perf-value">{bestDay}</span>
                                    <span className="perf-label">Most Active Day</span>
                                </div>
                            </div>
                            <div className="perf-insight">
                                <div className="perf-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                                    <HiClock />
                                </div>
                                <div className="perf-content">
                                    <span className="perf-value">{bestHour}</span>
                                    <span className="perf-label">Peak Time</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extended Leaderboard */}
                    <div className="card">
                        <h3 className="mb-2">🏆 Full Promoter Rankings</h3>
                        <div className="full-leaderboard">
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Promoter</th>
                                        <th>Photos</th>
                                        <th>Batches</th>
                                        <th>Approval Rate</th>
                                        <th>Trend</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promoterLeaderboard.map((promoter, index) => (
                                        <tr key={promoter.name}>
                                            <td className="rank-cell">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </td>
                                            <td className="name-cell">{promoter.name}</td>
                                            <td>{promoter.photos}</td>
                                            <td>{promoter.batches}</td>
                                            <td>
                                                <span className={`badge ${promoter.approvalRate >= 80 ? 'badge-approved' : promoter.approvalRate >= 50 ? 'badge-pending' : 'badge-rejected'}`}>
                                                    {promoter.approvalRate}%
                                                </span>
                                            </td>
                                            <td>
                                                {promoter.approvalRate >= 80 ? (
                                                    <span className="trend-up"><HiTrendingUp /> Strong</span>
                                                ) : promoter.approvalRate >= 50 ? (
                                                    <span className="trend-neutral">Average</span>
                                                ) : (
                                                    <span className="trend-down"><HiTrendingDown /> Needs Attention</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {promoterLeaderboard.length === 0 && (
                                <p className="text-muted text-center p-2">No promoter data yet</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style>{`
                .analytics-tabs {
                    display: flex;
                    gap: 0.5rem;
                    background: var(--bg-card);
                    padding: 0.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                }

                .tab-btn {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: transparent;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--text-secondary);
                }

                .tab-btn:hover {
                    background: var(--bg-tertiary);
                }

                .tab-btn.active {
                    background: var(--brand-gradient);
                    color: white;
                }

                .grid-4 {
                    grid-template-columns: repeat(4, 1fr);
                }

                @media (max-width: 1024px) {
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 640px) {
                    .grid-4 { grid-template-columns: 1fr; }
                    .analytics-tabs { flex-direction: column; }
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

                /* HEATMAP STYLES */
                .heatmap-container {
                    overflow-x: auto;
                }

                .heatmap-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: fit-content;
                }

                .heatmap-row {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                }

                .heatmap-header {
                    margin-bottom: 4px;
                }

                .heatmap-label {
                    width: 50px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .heatmap-hour-label {
                    width: 60px;
                    text-align: center;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .heatmap-cell {
                    width: 60px;
                    height: 40px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                    cursor: default;
                }

                .heatmap-cell:hover {
                    transform: scale(1.1);
                    z-index: 1;
                }

                .heatmap-value {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                }

                .heatmap-legend {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .legend-scale {
                    display: flex;
                    gap: 2px;
                }

                .legend-scale div {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                }

                .insights-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                }

                .insight-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                }

                .insight-icon {
                    font-size: 1.5rem;
                    color: var(--brand-primary);
                }

                .insight-card > div {
                    display: flex;
                    flex-direction: column;
                }

                .insight-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .insight-value {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                /* WOW STYLES */
                .wow-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                }

                .wow-card {
                    padding: 1.5rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-lg);
                }

                .wow-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .wow-label {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }

                .wow-change {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .wow-change.positive {
                    color: #22c55e;
                }

                .wow-change.negative {
                    color: #ef4444;
                }

                .wow-values {
                    display: flex;
                    flex-direction: column;
                }

                .wow-current {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .wow-previous {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                /* PERFORMANCE INSIGHTS */
                .insights-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                }

                .perf-insight {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                }

                .perf-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                }

                .perf-content {
                    display: flex;
                    flex-direction: column;
                }

                .perf-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .perf-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                /* FULL LEADERBOARD TABLE */
                .full-leaderboard {
                    overflow-x: auto;
                }

                .leaderboard-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .leaderboard-table th,
                .leaderboard-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }

                .leaderboard-table th {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .rank-cell {
                    font-size: 1.25rem;
                }

                .name-cell {
                    font-weight: 600;
                }

                .trend-up {
                    color: #22c55e;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.85rem;
                }

                .trend-down {
                    color: #ef4444;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.85rem;
                }

                .trend-neutral {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }

                @media (max-width: 768px) {
                    .wow-grid, .insights-grid, .insights-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ManagerAnalytics;
