import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import { 
    HiBriefcase, 
    HiSearch, 
    HiRefresh, 
    HiMail, 
    HiOfficeBuilding, 
    HiPhotograph, 
    HiCheckCircle, 
    HiClock, 
    HiDocumentReport, 
    HiX, 
    HiPlus, 
    HiPencil, 
    HiTrash,
    HiExternalLink
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminClients = () => {
    const [clients, setClients] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [managerFilter, setManagerFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');

    // Report Schedule Config Modal
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [scheduleValue, setScheduleValue] = useState('Weekly PDF Digest');

    useEffect(() => {
        fetchMetadata();
        fetchClients();
    }, [managerFilter, industryFilter]);

    const fetchMetadata = async () => {
        try {
            const res = await api.get('/users?role=manager');
            setManagers(res.data.users || []);
        } catch (err) {
            console.error('Failed to load managers', err);
        }
    };

    const fetchClients = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (managerFilter !== 'all') params.append('managerId', managerFilter);
            if (industryFilter !== 'all') params.append('industry', industryFilter);
            if (searchQuery) params.append('search', searchQuery);

            const res = await api.get(`/clients/admin/master-directory?${params.toString()}`);
            setClients(res.data.clients || []);
        } catch (err) {
            toast.error('Failed to load global client directory');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchClients();
    };

    // Resend Portal Invite
    const handleResendInvite = async (client) => {
        try {
            const res = await api.post(`/clients/admin/${client._id}/resend-invite`);
            toast.success(res.data.message || 'Client portal invite dispatched');
        } catch (err) {
            toast.error('Failed to dispatch client invite');
        }
    };

    // Save Automated Report Schedule
    const handleSaveSchedule = async (e) => {
        e.preventDefault();
        if (!selectedClient) return;
        try {
            const res = await api.put(`/clients/admin/${selectedClient._id}/config-reports`, {
                schedule: scheduleValue
            });
            toast.success(res.data.message || 'Report delivery schedule configured');
            setShowScheduleModal(false);
            setSelectedClient(null);
            fetchClients();
        } catch (err) {
            toast.error('Failed to update report schedule');
        }
    };

    // Extract unique industries for filter
    const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean)));
    const totalDeliveredPhotos = clients.reduce((sum, c) => sum + (c.stats?.totalPhotos || 0), 0);
    const totalActiveBatches = clients.reduce((sum, c) => sum + (c.stats?.totalBatches || 0), 0);

    return (
        <div className="admin-clients-page">
            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Global Client & Campaign Directory</h1>
                    <p className="page-sub-text">
                        Centralized directory of corporate clients, brand portfolios, automated delivery schedules, and client portal access.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-primary-blue" onClick={fetchClients}>
                        <HiRefresh /> Refresh Directory
                    </button>
                </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiBriefcase />
                        </div>
                        <div>
                            <span className="stat-val">{clients.length}</span>
                            <span className="stat-lbl">Corporate Clients</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                            <HiPhotograph />
                        </div>
                        <div>
                            <span className="stat-val">{totalDeliveredPhotos.toLocaleString()}</span>
                            <span className="stat-lbl">Verified Photos Delivered</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                            <HiCheckCircle />
                        </div>
                        <div>
                            <span className="stat-val">{totalActiveBatches}</span>
                            <span className="stat-lbl">Campaign Batches</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                            <HiDocumentReport />
                        </div>
                        <div>
                            <span className="stat-val">100%</span>
                            <span className="stat-lbl">Automated PDF Digests</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="filter-toolbar">
                <form onSubmit={handleSearchSubmit} className="filter-form">
                    <div className="search-input-wrap">
                        <HiSearch className="search-icon-svg" />
                        <input
                            type="text"
                            placeholder="Search by client brand name, contact person, or business email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button type="button" className="clear-btn" onClick={() => { setSearchQuery(''); fetchClients(); }}>
                                <HiX />
                            </button>
                        )}
                    </div>

                    <div className="selects-row">
                        <select
                            value={managerFilter}
                            onChange={(e) => setManagerFilter(e.target.value)}
                            className="clean-select"
                        >
                            <option value="all">All Managing Agencies</option>
                            {managers.map(m => (
                                <option key={m._id} value={m._id}>
                                    {m.companyName || m.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="clean-select"
                        >
                            <option value="all">All Industries</option>
                            {industries.map((ind, i) => (
                                <option key={i} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            {/* Master Clients Table */}
            <div className="table-wrapper-card">
                {loading ? (
                    <div className="loading-state">
                        <Spinner size={32} color="#2563eb" />
                    </div>
                ) : clients.length === 0 ? (
                    <div className="empty-feed">
                        <HiBriefcase size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                        <h3>No corporate clients found</h3>
                        <p>Try adjusting your search criteria or manager filter.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>CLIENT BRAND & CONTACT</th>
                                    <th>MANAGING AGENCY</th>
                                    <th>CAMPAIGN PROGRESS</th>
                                    <th>PORTAL STATUS</th>
                                    <th>REPORT SCHEDULE</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((c) => (
                                    <tr key={c._id}>
                                        <td>
                                            <div className="client-info-cell">
                                                <div className="client-avatar-badge">
                                                    {(c.name || 'C').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong className="client-title">{c.name}</strong>
                                                    <div className="contact-sub-meta">
                                                        <span>👤 {c.contactPerson || 'Contact'}</span>
                                                        <span>• ✉️ {c.contactEmail || 'No email'}</span>
                                                        {c.industry && <span>• 🏷️ {c.industry}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="agency-cell">
                                                <strong>{c.manager?.companyName || c.manager?.name || 'Unassigned'}</strong>
                                                <span className="sub-text">👤 {c.manager?.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="campaign-stat-cell">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span><strong>{c.stats?.totalPhotos || 0}</strong> Photos Delivered</span>
                                                    <span className="font-bold text-blue-600">{c.stats?.totalBatches || 0} Batches</span>
                                                </div>
                                                <div className="quota-progress-track">
                                                    <div 
                                                        className="quota-progress-fill" 
                                                        style={{ width: `${Math.min(100, Math.max(15, (c.stats?.approvedBatches || 1) * 20))}%`, background: '#2563eb' }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${c.contactEmail ? 'active' : 'pending'}`}>
                                                {c.portalStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge-schedule">
                                                📅 {c.autoReportSchedule}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button 
                                                    className="btn-action btn-inspect" 
                                                    onClick={() => handleResendInvite(c)}
                                                    title="Resend Client Portal Login Invite"
                                                >
                                                    <HiMail /> Resend Invite
                                                </button>
                                                <button 
                                                    className="btn-action btn-secondary-act"
                                                    onClick={() => { setSelectedClient(c); setScheduleValue(c.autoReportSchedule || 'Weekly PDF Digest'); setShowScheduleModal(true); }}
                                                    title="Configure Automated Reports"
                                                >
                                                    <HiDocumentReport /> Schedule
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════════════════════
                 AUTOMATED REPORT SCHEDULE MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showScheduleModal && selectedClient && (
                <div className="high-z-overlay" onClick={() => setShowScheduleModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiDocumentReport style={{ color: '#2563eb', fontSize: '1.25rem' }} />
                                <h3>Automated Report Delivery</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowScheduleModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSchedule} className="dialog-body">
                            <p className="dialog-desc">
                                Configure automated campaign digest and audit reports for <strong>{selectedClient.name}</strong>:
                            </p>

                            <div className="dialog-field">
                                <label>Delivery Frequency & Format *</label>
                                <select
                                    className="dialog-select"
                                    value={scheduleValue}
                                    onChange={(e) => setScheduleValue(e.target.value)}
                                >
                                    <option value="Daily Summary Digest">Daily Summary Digest (08:00 UTC)</option>
                                    <option value="Weekly PDF Digest">Weekly PDF Digest (Every Monday)</option>
                                    <option value="Bi-Weekly Executive Deck">Bi-Weekly Executive Deck (1st & 15th)</option>
                                    <option value="Monthly Certified Audit Export">Monthly Certified Audit Export (1st of month)</option>
                                    <option value="Real-Time Batch Notifications">Real-Time Instant Batch Notifications</option>
                                    <option value="Manual Delivery Only">Manual Delivery Only (No Auto-Schedule)</option>
                                </select>
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowScheduleModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-blue">
                                    Save Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .admin-clients-page {
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

                .client-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .client-avatar-badge {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: #2563eb;
                    color: #ffffff;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                    flex-shrink: 0;
                }

                .client-title {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .contact-sub-meta {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                    display: flex;
                    gap: 5px;
                    flex-wrap: wrap;
                }

                .agency-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .sub-text {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }

                .campaign-stat-cell {
                    min-width: 160px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .quota-progress-track {
                    height: 6px;
                    background: var(--bg-primary);
                    border-radius: 999px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }

                .quota-progress-fill {
                    height: 100%;
                    border-radius: 999px;
                    transition: width 0.3s ease;
                }

                .badge-schedule {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.76rem;
                    font-weight: 600;
                    background: #f1f5f9;
                    color: #334155;
                }

                .status-pill {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 700;
                }
                .status-pill.active { background: #f0fdf4; color: #16a34a; }
                .status-pill.pending { background: #fffbeb; color: #b45309; }

                .actions-cell {
                    display: flex;
                    gap: 5px;
                    justify-content: flex-end;
                }

                .btn-action {
                    padding: 6px 9px;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.15s ease;
                }

                .btn-action:hover { background: var(--bg-secondary); }

                .btn-inspect { background: #2563eb; color: #ffffff; border-color: #2563eb; }
                .btn-inspect:hover { background: #1d4ed8; }

                /* Modals */
                .high-z-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(5px);
                    z-index: 20000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .popup-dialog {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    width: min(500px, 95vw);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                }

                .popup-header {
                    padding: 14px 18px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-primary);
                }

                .popup-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                }

                .dialog-body {
                    padding: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .dialog-desc {
                    margin: 0;
                    font-size: 0.88rem;
                    color: var(--text-secondary);
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

                .dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 6px;
                }

                .btn-cancel {
                    padding: 8px 14px;
                    border-radius: 8px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-confirm-blue {
                    padding: 8px 16px;
                    border-radius: 8px;
                    background: #2563eb;
                    border: none;
                    color: #ffffff;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-confirm-blue:hover { background: #1d4ed8; }
            `}</style>
        </div>
    );
};

export default AdminClients;
