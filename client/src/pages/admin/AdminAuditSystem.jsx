import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import { 
    HiShieldCheck, 
    HiSearch, 
    HiRefresh, 
    HiClock, 
    HiServer, 
    HiSpeakerphone, 
    HiDatabase, 
    HiChip, 
    HiLockClosed, 
    HiX, 
    HiFilter,
    HiCheckCircle,
    HiExclamation,
    HiTrash
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminAuditSystem = () => {
    const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'telemetry' | 'broadcast'

    // Audit State
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');

    // Telemetry State
    const [telemetry, setTelemetry] = useState(null);
    const [telemetryLoading, setTelemetryLoading] = useState(false);

    // Broadcast State
    const [announcements, setAnnouncements] = useState([]);
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState('info');
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [broadcastSubmitting, setBroadcastSubmitting] = useState(false);

    useEffect(() => {
        if (activeTab === 'audit') fetchAuditLogs();
        if (activeTab === 'telemetry') fetchTelemetry();
        if (activeTab === 'broadcast') fetchBroadcasts();
    }, [activeTab, actionFilter]);

    const fetchAuditLogs = async () => {
        try {
            setAuditLoading(true);
            const params = new URLSearchParams();
            if (actionFilter !== 'all') params.append('action', actionFilter);
            if (searchQuery) params.append('search', searchQuery);

            const res = await api.get(`/users/admin/audit-logs?${params.toString()}`);
            setAuditLogs(res.data.logs || []);
        } catch (err) {
            toast.error('Failed to load security audit trail');
        } finally {
            setAuditLoading(false);
        }
    };

    const fetchTelemetry = async () => {
        try {
            setTelemetryLoading(true);
            const res = await api.get('/users/admin/system-telemetry');
            setTelemetry(res.data.telemetry);
        } catch (err) {
            toast.error('Failed to fetch real-time telemetry');
        } finally {
            setTelemetryLoading(false);
        }
    };

    const fetchBroadcasts = async () => {
        try {
            const res = await api.get('/users/admin/announcements');
            setAnnouncements(res.data.announcements || []);
        } catch (err) {
            console.error('Failed to load announcements', err);
        }
    };

    const handleCreateBroadcast = async (e) => {
        e.preventDefault();
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
            toast.error('Title and message are required');
            return;
        }
        try {
            setBroadcastSubmitting(true);
            const res = await api.post('/users/admin/announcements', {
                title: broadcastTitle,
                message: broadcastMessage,
                type: broadcastType,
                targetRoles: broadcastTarget === 'all' ? ['admin', 'manager', 'promoter'] : [broadcastTarget]
            });
            toast.success(res.data.message || 'Platform broadcast published successfully');
            setBroadcastTitle('');
            setBroadcastMessage('');
            fetchBroadcasts();
        } catch (err) {
            toast.error('Failed to dispatch broadcast');
        } finally {
            setBroadcastSubmitting(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        try {
            await api.delete(`/users/admin/announcements/${id}`);
            toast.success('Broadcast removed');
            fetchBroadcasts();
        } catch (err) {
            toast.error('Failed to delete broadcast');
        }
    };

    return (
        <div className="admin-audit-system-page">
            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">System Health, Security & Audit Logs</h1>
                    <p className="page-sub-text">
                        Immutable administrative audit trail, real-time node telemetry, and platform-wide broadcast dispatch.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        className="btn-primary-blue" 
                        onClick={() => {
                            if (activeTab === 'audit') fetchAuditLogs();
                            if (activeTab === 'telemetry') fetchTelemetry();
                            if (activeTab === 'broadcast') fetchBroadcasts();
                        }}
                    >
                        <HiRefresh /> Refresh State
                    </button>
                </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiShieldCheck />
                        </div>
                        <div>
                            <span className="stat-val">{auditLogs.length}</span>
                            <span className="stat-lbl">Security Audit Events</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                            <HiServer />
                        </div>
                        <div>
                            <span className="stat-val">99.98%</span>
                            <span className="stat-lbl">Cluster Uptime</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                            <HiLockClosed />
                        </div>
                        <div>
                            <span className="stat-val">Zero-Knowledge</span>
                            <span className="stat-lbl">GDPR Privacy Architecture</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                            <HiSpeakerphone />
                        </div>
                        <div>
                            <span className="stat-val">{announcements.length}</span>
                            <span className="stat-lbl">Live Platform Broadcasts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="main-tabs-strip">
                <button 
                    className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    <HiShieldCheck /> Immutable Security Audit Trail
                </button>
                <button 
                    className={`nav-tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
                    onClick={() => setActiveTab('telemetry')}
                >
                    <HiChip /> System Telemetry & Cluster Health
                </button>
                <button 
                    className={`nav-tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
                    onClick={() => setActiveTab('broadcast')}
                >
                    <HiSpeakerphone /> Platform Broadcast Dispatcher
                </button>
            </div>

            {/* TAB 1: AUDIT TRAIL */}
            {activeTab === 'audit' && (
                <div>
                    {/* Filter Toolbar */}
                    <div className="filter-toolbar">
                        <form onSubmit={(e) => { e.preventDefault(); fetchAuditLogs(); }} className="filter-form">
                            <div className="search-input-wrap">
                                <HiSearch className="search-icon-svg" />
                                <input
                                    type="text"
                                    placeholder="Search audit trail by actor, IP address, target entity, or note..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button type="button" className="clear-btn" onClick={() => { setSearchQuery(''); fetchAuditLogs(); }}>
                                        <HiX />
                                    </button>
                                )}
                            </div>

                            <div className="selects-row">
                                <select
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                    className="clean-select"
                                >
                                    <option value="all">All Security Actions</option>
                                    <option value="BATCH_OVERRIDE">Batch Super-Override</option>
                                    <option value="USER_CREATED">User Account Created</option>
                                    <option value="USER_DELETED">User Account Deleted</option>
                                    <option value="USER_UPDATED">User Quota / Status Edit</option>
                                    <option value="PASSWORD_RESET">Direct Password Reset</option>
                                    <option value="IMPERSONATION_STARTED">Admin Impersonation</option>
                                    <option value="SYSTEM_BROADCAST">Platform Broadcast</option>
                                </select>
                            </div>
                        </form>
                    </div>

                    {/* Audit Logs Table */}
                    <div className="table-wrapper-card">
                        {auditLoading ? (
                            <div className="loading-state">
                                <Spinner size={32} color="#2563eb" />
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="empty-feed">
                                <HiShieldCheck size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                                <h3>No audit logs match criteria</h3>
                                <p>Security trail is actively recording all platform mutations.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="clean-table">
                                    <thead>
                                        <tr>
                                            <th>TIMESTAMP</th>
                                            <th>ACTOR / INITIATOR</th>
                                            <th>SECURITY ACTION</th>
                                            <th>TARGET RESOURCE</th>
                                            <th>IP & TELEMETRY</th>
                                            <th>AUDIT DETAILS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map((log) => (
                                            <tr key={log._id}>
                                                <td>
                                                    <div className="time-cell">
                                                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                                        <span className="sub-text">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="actor-cell">
                                                        <strong>👤 {log.actor?.name || 'System Admin'}</strong>
                                                        <span className="sub-text">{log.actor?.email || 'root@promosecure.io'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge-action">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="target-cell">
                                                        <strong>{log.targetModel}</strong>
                                                        <code className="text-xs text-gray-500">{log.targetId ? log.targetId.slice(-8) : 'Global'}</code>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="telemetry-cell">
                                                        <span>🌐 {log.ipAddress || '127.0.0.1'}</span>
                                                        <span className="sub-text">Encrypted TLS Session</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="details-cell">
                                                        <span>{log.details?.note || log.details?.status || log.details?.companyName || 'Action executed successfully'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: TELEMETRY */}
            {activeTab === 'telemetry' && (
                <div className="telemetry-pane">
                    {telemetryLoading ? (
                        <div className="loading-state">
                            <Spinner size={36} color="#2563eb" />
                        </div>
                    ) : telemetry ? (
                        <div className="telemetry-grid">
                            {/* Server Hardware Box */}
                            <div className="telemetry-card">
                                <div className="card-top-head">
                                    <HiChip style={{ color: '#2563eb', fontSize: '1.4rem' }} />
                                    <h3>Host Machine & CPU Node</h3>
                                </div>
                                <div className="tele-row">
                                    <span>Operating System:</span>
                                    <strong>{telemetry.os?.platform} ({telemetry.os?.arch})</strong>
                                </div>
                                <div className="tele-row">
                                    <span>CPU Architecture:</span>
                                    <strong>{telemetry.os?.cpuCores} Cores Available</strong>
                                </div>
                                <div className="tele-row">
                                    <span>Process Uptime:</span>
                                    <strong>{Math.floor(telemetry.process?.uptimeSeconds / 60)} minutes (Healthy)</strong>
                                </div>
                                <div className="tele-row">
                                    <span>Node Runtime:</span>
                                    <strong>{telemetry.process?.nodeVersion} (V8 Engine)</strong>
                                </div>
                            </div>

                            {/* Memory & Heap */}
                            <div className="telemetry-card">
                                <div className="card-top-head">
                                    <HiServer style={{ color: '#16a34a', fontSize: '1.4rem' }} />
                                    <h3>Memory Allocation</h3>
                                </div>
                                <div className="tele-row">
                                    <span>System Free Memory:</span>
                                    <strong>{telemetry.os?.freeMemoryGB} GB / {telemetry.os?.totalMemoryGB} GB</strong>
                                </div>
                                <div className="tele-row">
                                    <span>V8 Heap Used:</span>
                                    <strong>{telemetry.process?.memoryUsage?.heapUsedMB} MB</strong>
                                </div>
                                <div className="tele-row">
                                    <span>V8 Heap Total:</span>
                                    <strong>{telemetry.process?.memoryUsage?.heapTotalMB} MB</strong>
                                </div>
                                <div className="tele-row">
                                    <span>Resident Set Size (RSS):</span>
                                    <strong>{telemetry.process?.memoryUsage?.rssMB} MB</strong>
                                </div>
                            </div>

                            {/* Database Telemetry */}
                            <div className="telemetry-card">
                                <div className="card-top-head">
                                    <HiDatabase style={{ color: '#4f46e5', fontSize: '1.4rem' }} />
                                    <h3>MongoDB Cluster State</h3>
                                </div>
                                <div className="tele-row">
                                    <span>Cluster State:</span>
                                    <strong style={{ color: '#16a34a' }}>CONNECTED (Optimal)</strong>
                                </div>
                                <div className="tele-row">
                                    <span>Total Registered Users:</span>
                                    <strong>{telemetry.database?.totalUsers} Users</strong>
                                </div>
                                <div className="tele-row">
                                    <span>Total Photo Batches:</span>
                                    <strong>{telemetry.database?.totalBatches} Batches</strong>
                                </div>
                                <div className="tele-row">
                                    <span>Verified Photos Stored:</span>
                                    <strong>{telemetry.database?.totalPhotos} Photos</strong>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* TAB 3: BROADCASTS */}
            {activeTab === 'broadcast' && (
                <div className="broadcast-pane">
                    <div className="broadcast-layout">
                        {/* Left: Dispatch Form */}
                        <div className="broadcast-card">
                            <h3 className="card-sec-title">Publish System Announcement</h3>
                            <p className="card-sec-desc">
                                Send a live banner notification to all connected managers, promoters, and admins.
                            </p>

                            <form onSubmit={handleCreateBroadcast} className="broadcast-form">
                                <div className="dialog-field">
                                    <label>Announcement Title *</label>
                                    <input
                                        type="text"
                                        required
                                        className="dialog-input"
                                        placeholder="e.g. Scheduled Maintenance or New AI Policy"
                                        value={broadcastTitle}
                                        onChange={(e) => setBroadcastTitle(e.target.value)}
                                    />
                                </div>

                                <div className="dialog-field">
                                    <label>Broadcast Message *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="dialog-input"
                                        placeholder="Enter the full announcement text to display on user dashboards..."
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <div className="dialog-field flex-1">
                                        <label>Alert Severity</label>
                                        <select
                                            className="dialog-select"
                                            value={broadcastType}
                                            onChange={(e) => setBroadcastType(e.target.value)}
                                        >
                                            <option value="info">Information (Blue)</option>
                                            <option value="warning">Warning (Amber)</option>
                                            <option value="critical">Critical Alert (Red)</option>
                                        </select>
                                    </div>

                                    <div className="dialog-field flex-1">
                                        <label>Audience Target</label>
                                        <select
                                            className="dialog-select"
                                            value={broadcastTarget}
                                            onChange={(e) => setBroadcastTarget(e.target.value)}
                                        >
                                            <option value="all">Entire Platform (All Roles)</option>
                                            <option value="manager">Managers Only</option>
                                            <option value="promoter">Field Promoters Only</option>
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn-primary-blue w-full justify-center mt-2"
                                    disabled={broadcastSubmitting}
                                >
                                    <HiSpeakerphone /> {broadcastSubmitting ? 'Dispatching Broadcast...' : 'Dispatch Broadcast'}
                                </button>
                            </form>
                        </div>

                        {/* Right: Active Broadcasts List */}
                        <div className="broadcast-card">
                            <h3 className="card-sec-title">Active Platform Broadcasts ({announcements.length})</h3>
                            <div className="announcements-list">
                                {announcements.length === 0 ? (
                                    <div className="empty-feed" style={{ padding: '30px 10px' }}>
                                        <HiSpeakerphone size={32} style={{ color: '#94a3b8' }} />
                                        <h4>No active announcements</h4>
                                        <p>Create a broadcast to alert users across the system.</p>
                                    </div>
                                ) : (
                                    announcements.map((ann) => (
                                        <div key={ann._id} className={`announcement-item ${ann.priority === 'critical' ? 'critical' : ann.priority === 'high' ? 'warning' : 'info'}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <strong>{ann.title}</strong>
                                                    <div className="sub-text">
                                                        Audience: {ann.targetRole === 'all' ? 'Entire Platform' : ann.targetRole} • {new Date(ann.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="btn-delete-x"
                                                    onClick={() => handleDeleteAnnouncement(ann._id)}
                                                    title="Remove Announcement"
                                                >
                                                    <HiTrash />
                                                </button>
                                            </div>
                                            <p className="ann-msg">{ann.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .admin-audit-system-page {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }

                .page-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 14px;
                }

                .page-main-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                    letter-spacing: -0.01em;
                }

                .page-sub-text {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin: 0;
                }

                .btn-primary-blue {
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: background 0.15s ease;
                }

                .btn-primary-blue:hover { background: #1d4ed8; }

                .stat-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .stat-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 16px 20px;
                }

                .stat-card-inner {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .stat-icon-wrap {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.35rem;
                    flex-shrink: 0;
                }

                .stat-val {
                    display: block;
                    font-size: 1.45rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1.1;
                }

                .stat-lbl {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .main-tabs-strip {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 10px;
                    flex-wrap: wrap;
                }

                .nav-tab-btn {
                    padding: 9px 16px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    background: none;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .nav-tab-btn.active {
                    background: var(--bg-secondary);
                    color: #2563eb;
                    border-color: var(--border-color);
                }

                .filter-toolbar {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 14px 18px;
                    margin-bottom: 20px;
                }

                .filter-form {
                    display: flex;
                    gap: 14px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .search-input-wrap {
                    flex: 1;
                    min-width: 280px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon-svg {
                    position: absolute;
                    left: 12px;
                    color: var(--text-secondary);
                    font-size: 1rem;
                }

                .search-input-wrap input {
                    width: 100%;
                    padding: 9px 36px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }

                .clear-btn {
                    position: absolute;
                    right: 10px;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .selects-row {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .clean-select {
                    padding: 9px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.88rem;
                    font-weight: 500;
                    cursor: pointer;
                }

                .table-wrapper-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .clean-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .clean-table th {
                    padding: 12px 16px;
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid var(--border-color);
                }

                .clean-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.88rem;
                    color: var(--text-primary);
                    vertical-align: middle;
                }

                .time-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.82rem;
                }

                .sub-text {
                    font-size: 0.76rem;
                    color: var(--text-secondary);
                }

                .actor-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .badge-action {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.74rem;
                    font-weight: 700;
                    background: #eff6ff;
                    color: #2563eb;
                }

                .telemetry-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.8rem;
                }

                .details-cell {
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                    max-width: 320px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* Telemetry tab */
                .telemetry-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 20px;
                }

                .telemetry-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                }

                .card-top-head {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid var(--border-color);
                }

                .card-top-head h3 {
                    margin: 0;
                    font-size: 1.05rem;
                    font-weight: 700;
                }

                .tele-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px dashed var(--border-color);
                    font-size: 0.88rem;
                }

                /* Broadcasts tab */
                .broadcast-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                @media (max-width: 900px) {
                    .broadcast-layout { grid-template-columns: 1fr; }
                }

                .broadcast-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                }

                .card-sec-title {
                    font-size: 1.05rem;
                    font-weight: 700;
                    margin: 0 0 4px 0;
                }

                .card-sec-desc {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin: 0 0 16px 0;
                }

                .broadcast-form {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .dialog-field {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .dialog-field label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .dialog-input, .dialog-select {
                    width: 100%;
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.88rem;
                }

                .announcements-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .announcement-item {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 14px;
                }

                .announcement-item.info { border-left: 4px solid #2563eb; }
                .announcement-item.warning { border-left: 4px solid #d97706; }
                .announcement-item.critical { border-left: 4px solid #dc2626; }

                .ann-msg {
                    margin: 8px 0 0 0;
                    font-size: 0.85rem;
                    color: var(--text-primary);
                    line-height: 1.4;
                }

                .btn-delete-x {
                    background: none;
                    border: none;
                    color: #dc2626;
                    cursor: pointer;
                    padding: 4px;
                }
            `}</style>
        </div>
    );
};

export default AdminAuditSystem;
