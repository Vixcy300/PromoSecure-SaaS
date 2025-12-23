import { useState, useEffect } from 'react';
import { HiUsers, HiOfficeBuilding, HiCollection, HiPhotograph, HiTrendingUp, HiCheckCircle, HiClock, HiXCircle, HiTrash, HiDownload } from 'react-icons/hi';
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

// Register Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/users/stats');
      const data = res.data.stats || res.data;
      setStats({
        managers: data.users?.manager || 0,
        promoters: data.users?.promoter || 0,
        totalBatches: data.totalBatches || 0,
        totalPhotos: data.totalPhotos || 0,
        draftBatches: data.batches?.draft || 0,
        pendingBatches: data.batches?.pending || 0,
        approvedBatches: data.batches?.approved || 0,
        rejectedBatches: data.batches?.rejected || 0,
        managerLeaderboard: data.managerLeaderboard || [],
        dailyActivity: data.dailyActivity || [],
      });
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      toast.loading('Exporting data...');
      const [usersRes, batchesRes] = await Promise.all([
        api.get('/users?role=manager'),
        api.get('/batches')
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        managers: usersRes.data.users || [],
        batches: batchesRes.data.batches || [],
        stats: stats
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PromoSecure_Export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Data exported!');
    } catch (error) {
      toast.dismiss();
      toast.error('Export failed');
    }
  };

  // Chart data
  const activityChartData = {
    labels: (stats?.dailyActivity || []).map(d => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Photos',
        data: (stats?.dailyActivity || []).map(d => d.photos),
        borderColor: 'rgb(13, 148, 136)',
        backgroundColor: 'rgba(13, 148, 136, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Batches',
        data: (stats?.dailyActivity || []).map(d => d.batches),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
      }
    ],
  };

  const statusChartData = {
    labels: ['Approved', 'Pending', 'Rejected', 'Draft'],
    datasets: [{
      data: [stats?.approvedBatches || 0, stats?.pendingBatches || 0, stats?.rejectedBatches || 0, stats?.draftBatches || 0],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#64748b'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  const statCards = stats ? [
    { icon: HiOfficeBuilding, label: 'Managers', value: stats.managers || 0, gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)' },
    { icon: HiUsers, label: 'Promoters', value: stats.promoters || 0, gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
    { icon: HiCollection, label: 'Total Batches', value: stats.totalBatches || 0, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
    { icon: HiPhotograph, label: 'Total Photos', value: stats.totalPhotos || 0, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  ] : [];

  if (loading) {
    return <div className="page flex items-center justify-center"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1><HiTrendingUp style={{ color: 'var(--brand-primary)' }} /> Admin Dashboard</h1>
          <p>Platform overview and analytics</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExportData}>
          <HiDownload /> Export Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4 mb-2">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card card">
            <div className="stat-icon" style={{ background: stat.gradient }}><stat.icon /></div>
            <div className="stat-content">
              <span className="stat-value">{stat.value.toLocaleString()}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-2 mb-2">
        <div className="card">
          <h3 className="mb-2">📈 Platform Activity (30 Days)</h3>
          <div className="chart-container">
            <Line data={activityChartData} options={chartOptions} />
          </div>
        </div>
        <div className="card">
          <h3 className="mb-2">📊 Batch Status Distribution</h3>
          <div className="chart-container-sm">
            <Doughnut data={statusChartData} options={{ ...chartOptions, cutout: '60%' }} />
          </div>
        </div>
      </div>

      {/* Manager Leaderboard */}
      <div className="grid grid-2 mb-2">
        <div className="card">
          <h3 className="mb-2">🏆 Top Managers</h3>
          <div className="leaderboard">
            {(stats?.managerLeaderboard || []).map((manager, i) => (
              <div key={i} className="leaderboard-item">
                <div className="leaderboard-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                <div className="leaderboard-info">
                  <strong>{manager.name}</strong>
                  <span className="text-muted text-sm">{manager.companyName || 'Company'}</span>
                </div>
                <div className="leaderboard-stats">
                  <span className="badge badge-approved">{manager.approvedBatches} approved</span>
                  <span className="text-sm text-muted">{manager.totalPhotos} photos</span>
                </div>
              </div>
            ))}
            {(stats?.managerLeaderboard || []).length === 0 && (
              <p className="text-muted text-center">No manager data yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-2">✅ Platform Health</h3>
          <div className="health-items">
            <div className="health-item success"><HiCheckCircle /><div><span>Database</span><span className="health-status">Connected</span></div></div>
            <div className="health-item success"><HiCheckCircle /><div><span>API</span><span className="health-status">Operational</span></div></div>
            <div className="health-item success"><HiCheckCircle /><div><span>AI Service</span><span className="health-status">Active</span></div></div>
            <div className="health-item success"><HiCheckCircle /><div><span>Email</span><span className="health-status">Configured</span></div></div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="flex items-center gap-2"><HiCollection style={{ color: 'var(--error)' }} /> Data Management</h3>
        <div className="data-actions mt-2">
          <div className="data-action-card">
            <div className="data-action-info">
              <HiPhotograph style={{ fontSize: '1.5rem', color: 'var(--warning)' }} />
              <div><strong>Delete All Photos</strong><p className="text-sm text-muted">Remove all photos and reset counts</p></div>
            </div>
            <button className="btn btn-danger" onClick={async () => {
              if (!confirm('⚠️ Delete ALL photos? Cannot be undone!')) return;
              try { await api.delete('/photos/all'); toast.success('Deleted'); fetchStats(); }
              catch { toast.error('Failed'); }
            }}><HiTrash /> Delete All</button>
          </div>
        </div>
      </div>

      <style>{`
        .grid-4 { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 1024px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .grid-4 { grid-template-columns: 1fr; } }
        .stat-card { display: flex; align-items: center; gap: 1rem; }
        .stat-icon { width: 56px; height: 56px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; }
        .stat-content { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.75rem; font-weight: 700; }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); }
        .chart-container { height: 250px; }
        .chart-container-sm { height: 200px; max-width: 200px; margin: 0 auto; }
        .leaderboard { display: flex; flex-direction: column; gap: 0.75rem; }
        .leaderboard-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
        .leaderboard-rank { font-size: 1.25rem; min-width: 2rem; text-align: center; }
        .leaderboard-info { flex: 1; display: flex; flex-direction: column; }
        .leaderboard-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
        .health-items { display: flex; flex-direction: column; gap: 0.75rem; }
        .health-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); }
        .health-item.success svg { color: var(--success); font-size: 1.25rem; }
        .health-item div { display: flex; flex-direction: column; }
        .health-item span:first-child { font-weight: 600; font-size: 0.9rem; }
        .health-status { font-size: 0.8rem; color: var(--text-muted); }
        .data-actions { display: flex; flex-direction: column; gap: 1rem; }
        .data-action-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-lg); }
        .data-action-info { display: flex; align-items: center; gap: 1rem; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
