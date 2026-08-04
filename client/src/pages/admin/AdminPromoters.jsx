import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import { 
    HiUserGroup, 
    HiSearch, 
    HiEye, 
    HiKey, 
    HiLogin, 
    HiBan, 
    HiCheck, 
    HiX, 
    HiShieldCheck, 
    HiLocationMarker, 
    HiDeviceMobile, 
    HiSwitchHorizontal, 
    HiRefresh, 
    HiOfficeBuilding, 
    HiExternalLink,
    HiClock,
    HiSparkles,
    HiCheckCircle,
    HiXCircle
} from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminPromoters = () => {
    const { startImpersonation } = useAuth();

    // State
    const [promoters, setPromoters] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [managerFilter, setManagerFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dossier Drawer State
    const [showDossier, setShowDossier] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState(null);
    const [dossierLoading, setDossierLoading] = useState(false);
    const [activeDossierTab, setActiveDossierTab] = useState('scorecard');

    // Action Modals
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [promoterToReassign, setPromoterToReassign] = useState(null);
    const [targetManagerId, setTargetManagerId] = useState('');

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [resettingPromoter, setResettingPromoter] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [promotersRes, managersRes] = await Promise.all([
                api.get('/users/promoters/intelligence'),
                api.get('/users?role=manager')
            ]);
            setPromoters(promotersRes.data.promoters || []);
            setManagers(managersRes.data.users || []);
        } catch (error) {
            toast.error('Failed to load promoter registry');
        } finally {
            setLoading(false);
        }
    };

    // Open Promoter Dossier
    const openDossier = async (promoter) => {
        setShowDossier(true);
        setDossierLoading(true);
        setActiveDossierTab('scorecard');
        try {
            const res = await api.get(`/users/promoter/${promoter._id}/dossier`);
            setSelectedDossier(res.data.dossier);
        } catch (error) {
            toast.error('Failed to load promoter dossier');
            setShowDossier(false);
        } finally {
            setDossierLoading(false);
        }
    };

    // Reassign Promoter
    const handleReassign = async (e) => {
        e.preventDefault();
        if (!promoterToReassign || !targetManagerId) return;
        try {
            const res = await api.put(`/users/promoter/${promoterToReassign._id}/reassign`, {
                targetManagerId
            });
            toast.success(res.data.message || 'Promoter reassigned successfully');
            setShowReassignModal(false);
            setPromoterToReassign(null);
            setTargetManagerId('');
            fetchData();
            if (selectedDossier) {
                openDossier(selectedDossier.promoter);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reassign promoter');
        }
    };

    // Direct Password Reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resettingPromoter || !newPassword) return;
        try {
            const res = await api.post(`/users/manager/${resettingPromoter._id}/reset-password`, {
                newPassword
            });
            toast.success(res.data.message || 'Password reset successfully');
            setShowPasswordModal(false);
            setNewPassword('');
            setResettingPromoter(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password reset failed');
        }
    };

    // Impersonate Promoter ("Test Camera & View as Promoter")
    const handleImpersonate = async (promoter) => {
        if (!window.confirm(`Log in as ${promoter.name}? You will view the application exactly as this field promoter.`)) {
            return;
        }
        try {
            const res = await api.post(`/users/impersonate/${promoter._id}`);
            startImpersonation(res.data.token, res.data.user);
            toast.success(`Logged in as ${promoter.name}. Redirecting to Promoter Dashboard...`);
            window.location.href = '/promoter';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Impersonation failed');
        }
    };

    // Toggle Active/Inactive
    const handleToggleStatus = async (promoter) => {
        try {
            await api.put(`/users/${promoter._id}/toggle`);
            toast.success(`Promoter ${promoter.isActive !== false ? 'suspended' : 'activated'}`);
            fetchData();
            if (selectedDossier && selectedDossier.promoter._id === promoter._id) {
                openDossier(promoter);
            }
        } catch (error) {
            toast.error('Failed to update promoter status');
        }
    };

    // Filter Logic
    const filteredPromoters = promoters.filter(p => {
        const matchesSearch = 
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.createdBy?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesManager = managerFilter === 'all' || p.createdBy?._id === managerFilter;
        const matchesStatus = 
            statusFilter === 'all' ||
            (statusFilter === 'active' && p.isActive !== false) ||
            (statusFilter === 'inactive' && p.isActive === false);

        return matchesSearch && matchesManager && matchesStatus;
    });

    const activeCount = promoters.filter(p => p.isActive !== false).length;
    const onlineCount = promoters.filter(p => p.isOnline).length;
    const totalBatches = promoters.reduce((acc, p) => acc + (p.stats?.totalBatches || 0), 0);

    return (
        <div className="admin-promoters-page">
            {/* Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Promoter Intelligence & Registry</h1>
                    <p className="page-sub-text">
                        Enterprise registry of field promoters, performance quality scorecards, device telemetry, and agency assignment.
                    </p>
                </div>
            </div>

            {/* Top Metric Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0f766e', background: '#ccfbf1' }}>
                            <HiUserGroup />
                        </div>
                        <div>
                            <span className="stat-val">{promoters.length}</span>
                            <span className="stat-lbl">Total Promoters</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                            <HiCheckCircle />
                        </div>
                        <div>
                            <span className="stat-val">{activeCount}</span>
                            <span className="stat-lbl">Active Field Staff</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                            <HiSparkles />
                        </div>
                        <div>
                            <span className="stat-val">{onlineCount}</span>
                            <span className="stat-lbl">Live Online Now</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#7c3aed', background: '#f5f3ff' }}>
                            <HiOfficeBuilding />
                        </div>
                        <div>
                            <span className="stat-val">{totalBatches}</span>
                            <span className="stat-lbl">Total Field Batches</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="filter-toolbar">
                <div className="filter-form">
                    <div className="search-input-wrap">
                        <HiSearch className="search-icon-svg" />
                        <input 
                            type="text" 
                            placeholder="Search by promoter name, email, or managing agency..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button type="button" className="clear-btn" onClick={() => setSearchQuery('')}>
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
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="clean-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Staff</option>
                            <option value="inactive">Suspended</option>
                        </select>

                        <button type="button" className="refresh-icon-btn" onClick={fetchData} title="Refresh Registry">
                            <HiRefresh />
                        </button>
                    </div>
                </div>
            </div>

            {/* Promoters Table */}
            <div className="table-wrapper-card">
                {loading ? (
                    <div className="loading-state">
                        <Spinner size={32} color="#0f766e" />
                    </div>
                ) : filteredPromoters.length === 0 ? (
                    <div className="empty-feed">
                        <HiUserGroup size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                        <h3>No promoters found</h3>
                        <p>No field promoters match your filter criteria.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>PROMOTER</th>
                                    <th>MANAGING AGENCY</th>
                                    <th>PERFORMANCE SCORE</th>
                                    <th>SUBMISSIONS</th>
                                    <th>LAST LOCATION / DEVICE</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPromoters.map((p) => {
                                    const stats = p.stats || {};
                                    const qualityScore = stats.qualityScore || 95;

                                    return (
                                        <tr key={p._id}>
                                            <td>
                                                <div className="promoter-info-cell">
                                                    <div className="promoter-avatar-badge">
                                                        {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <strong className="promoter-title-link" onClick={() => openDossier(p)}>
                                                                {p.name}
                                                            </strong>
                                                            <div className={`status-dot ${p.isOnline ? 'online' : 'offline'}`} title={p.isOnline ? 'Online Now' : 'Offline'}></div>
                                                        </div>
                                                        <div className="promoter-sub-meta">
                                                            <span>{p.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="agency-cell">
                                                    <strong>{p.createdBy?.companyName || p.createdBy?.name || 'Unassigned'}</strong>
                                                    <span className="agency-sub">{p.createdBy?.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="score-cell">
                                                    <strong style={{ color: qualityScore >= 90 ? '#16a34a' : qualityScore >= 75 ? '#0284c7' : '#dc2626' }}>
                                                        {qualityScore}%
                                                    </strong>
                                                    <span className="score-lbl">AI Quality Index</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="submission-cell">
                                                    <span><strong>{stats.totalBatches || 0}</strong> batches</span>
                                                    <span className="sub-ratio">{stats.approvedBatches || 0} approved / {stats.rejectedBatches || 0} rejected</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="telemetry-cell">
                                                    <span>📍 {stats.lastLocation || 'Field Location Active'}</span>
                                                    {stats.lastDevice && (
                                                        <span className="device-tag">📱 {stats.lastDevice}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${p.isActive !== false ? 'active' : 'suspended'}`}>
                                                    {p.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button 
                                                        className="btn-action btn-inspect" 
                                                        onClick={() => openDossier(p)} 
                                                        title="Open Deep Dossier"
                                                    >
                                                        <HiEye /> Dossier
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-secondary-act"
                                                        onClick={() => { setPromoterToReassign(p); setTargetManagerId(''); setShowReassignModal(true); }}
                                                        title="Reassign to Another Agency"
                                                    >
                                                        <HiSwitchHorizontal />
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-secondary-act"
                                                        onClick={() => { setResettingPromoter(p); setNewPassword(''); setShowPasswordModal(true); }}
                                                        title="Direct Password Reset"
                                                    >
                                                        <HiKey />
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-impersonate"
                                                        onClick={() => handleImpersonate(p)}
                                                        title="Login as Promoter (Test Camera)"
                                                    >
                                                        <HiLogin />
                                                    </button>
                                                    <button 
                                                        className={`btn-action ${p.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                                                        onClick={() => handleToggleStatus(p)}
                                                        title={p.isActive !== false ? 'Suspend Account' : 'Activate Account'}
                                                    >
                                                        {p.isActive !== false ? <HiBan /> : <HiCheck />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════════════════════════════════
                 REASSIGN PROMOTER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showReassignModal && promoterToReassign && (
                <div className="high-z-overlay" onClick={() => setShowReassignModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiSwitchHorizontal style={{ color: '#0d9488', fontSize: '1.25rem' }} />
                                <h3>Reassign Field Promoter</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowReassignModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleReassign} className="dialog-body">
                            <p className="dialog-desc">
                                Transfer <strong>{promoterToReassign.name}</strong> from <strong>{promoterToReassign.createdBy?.companyName || 'Current Agency'}</strong> to a new managing agency:
                            </p>

                            <div className="dialog-field">
                                <label>Destination Agency Manager *</label>
                                <select
                                    required
                                    className="dialog-select"
                                    value={targetManagerId}
                                    onChange={(e) => setTargetManagerId(e.target.value)}
                                >
                                    <option value="">Select Destination Agency...</option>
                                    {managers
                                        .filter(m => m._id !== promoterToReassign.createdBy?._id)
                                        .map(m => (
                                            <option key={m._id} value={m._id}>
                                                {m.companyName || m.name} ({m.name}) — Capacity: {m.promoterCount || 0}/{m.promoterLimit || 5}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowReassignModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-primary">
                                    Confirm Reassignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 PASSWORD RESET MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showPasswordModal && resettingPromoter && (
                <div className="high-z-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiKey style={{ color: '#d97706', fontSize: '1.25rem' }} />
                                <h3>Direct Password Override</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowPasswordModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordReset} className="dialog-body">
                            <p className="dialog-desc">
                                Set a direct new password for promoter <strong>{resettingPromoter.name}</strong> ({resettingPromoter.email}):
                            </p>

                            <div className="dialog-field">
                                <label>New Secure Password (min 6 characters) *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="dialog-input"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-override">
                                    Override Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 PROMOTER DOSSIER DRAWER (DEEP INTELLIGENCE & TELEMETRY)
               ════════════════════════════════════════════════════════════════ */}
            {showDossier && (
                <div className="dossier-drawer-overlay" onClick={() => setShowDossier(false)}>
                    <div className="dossier-drawer-content" onClick={(e) => e.stopPropagation()}>
                        <div className="dossier-header">
                            <div className="dossier-header-title">
                                <span className="dossier-tag">👥 PROMOTER INTELLIGENCE DOSSIER</span>
                                <h2>{selectedDossier?.promoter?.name || 'Loading Dossier...'}</h2>
                                <p>{selectedDossier?.promoter?.email} • Agency: {selectedDossier?.manager?.companyName || selectedDossier?.manager?.name || 'Independent'}</p>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowDossier(false)}>
                                <HiX size={22} />
                            </button>
                        </div>

                        {dossierLoading ? (
                            <div className="dossier-loading-wrap">
                                <Spinner size={36} color="#0f766e" />
                                <p>Compiling promoter telemetry, scores & batch stream...</p>
                            </div>
                        ) : selectedDossier ? (
                            <div className="dossier-body">
                                {/* Navigation Tabs */}
                                <div className="dossier-tabs-strip">
                                    <button 
                                        className={`dossier-tab-btn ${activeDossierTab === 'scorecard' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('scorecard')}
                                    >
                                        Performance Scorecard
                                    </button>
                                    <button 
                                        className={`dossier-tab-btn ${activeDossierTab === 'telemetry' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('telemetry')}
                                    >
                                        Device & Telemetry
                                    </button>
                                    <button 
                                        className={`dossier-tab-btn ${activeDossierTab === 'submissions' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('submissions')}
                                    >
                                        Recent Batches ({selectedDossier.recentBatches?.length || 0})
                                    </button>
                                </div>

                                {/* Scorecard Tab */}
                                {activeDossierTab === 'scorecard' && (
                                    <div className="tab-pane">
                                        <div className="dossier-kpi-grid">
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Total Batches Submitted</span>
                                                <strong className="kpi-val">{selectedDossier.metrics?.totalBatches || 0}</strong>
                                                <span className="kpi-sub">
                                                    {selectedDossier.metrics?.approved || 0} approved / {selectedDossier.metrics?.rejected || 0} rejected
                                                </span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">AI Quality & Lighting Score</span>
                                                <strong className="kpi-val" style={{ color: '#16a34a' }}>
                                                    {selectedDossier.metrics?.qualityScore || 95}%
                                                </strong>
                                                <span className="kpi-sub">Face Clarity & Lux Index</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Batch Pass Ratio</span>
                                                <strong className="kpi-val" style={{ color: '#0284c7' }}>
                                                    {selectedDossier.metrics?.approvalRatio || 100}%
                                                </strong>
                                                <span className="kpi-sub">Turnaround Speed: &lt; 2h</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Fraud / Duplicates Flagged</span>
                                                <strong className="kpi-val" style={{ color: selectedDossier.metrics?.totalDuplicates > 0 ? '#dc2626' : '#16a34a' }}>
                                                    {selectedDossier.metrics?.totalDuplicates || 0} Flagged
                                                </strong>
                                                <span className="kpi-sub">AI Perceptual Match</span>
                                            </div>
                                        </div>

                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Managing Agency Overview</h4>
                                            <div className="dossier-spec-row">
                                                <span>Agency / Company:</span>
                                                <strong>{selectedDossier.manager?.companyName || selectedDossier.manager?.name || 'Unassigned'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Manager Contact:</span>
                                                <strong>{selectedDossier.manager?.email || 'N/A'}</strong>
                                            </div>
                                            {selectedDossier.manager?.phone && (
                                                <div className="dossier-spec-row">
                                                    <span>Manager Phone:</span>
                                                    <strong>{selectedDossier.manager.phone}</strong>
                                                </div>
                                            )}
                                            <div className="dossier-spec-row">
                                                <span>Agency License Tier:</span>
                                                <strong className="tier-badge pro">
                                                    {(selectedDossier.manager?.licenseTier || 'pro').toUpperCase()}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Telemetry Tab */}
                                {activeDossierTab === 'telemetry' && (
                                    <div className="tab-pane">
                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Field Device & Location Telemetry</h4>
                                            <div className="dossier-spec-row">
                                                <span>Last Field Zone:</span>
                                                <strong>📍 {selectedDossier.telemetry?.lastLocation || 'Location Logged via GPS'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>GPS Coordinates:</span>
                                                {selectedDossier.telemetry?.lastGps?.latitude ? (
                                                    <a 
                                                        href={`https://www.google.com/maps?q=${selectedDossier.telemetry.lastGps.latitude},${selectedDossier.telemetry.lastGps.longitude}`}
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="gps-link"
                                                    >
                                                        🛰️ {selectedDossier.telemetry.lastGps.latitude.toFixed(4)}, {selectedDossier.telemetry.lastGps.longitude.toFixed(4)} <HiExternalLink />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500">Live GPS Zone Active</span>
                                                )}
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Device Hardware & OS:</span>
                                                <strong>📱 {selectedDossier.telemetry?.lastDevice || 'Mobile Field Agent Client'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Offline Sync Status:</span>
                                                <strong style={{ color: '#16a34a' }}>✓ IndexedDB Sync Operational</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Account Registered:</span>
                                                <strong>{new Date(selectedDossier.promoter.createdAt).toLocaleDateString()}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Last Active Time:</span>
                                                <strong>{selectedDossier.promoter.lastActive ? new Date(selectedDossier.promoter.lastActive).toLocaleString() : 'Recently active'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submissions Tab */}
                                {activeDossierTab === 'submissions' && (
                                    <div className="tab-pane">
                                        <h4 className="card-sec-title">Recent Submissions Stream</h4>
                                        <div className="recent-batches-list">
                                            {selectedDossier.recentBatches?.length === 0 ? (
                                                <p className="no-data-msg">No submissions on record for this promoter yet.</p>
                                            ) : (
                                                selectedDossier.recentBatches.map(b => (
                                                    <div key={b._id} className="recent-batch-row">
                                                        <div>
                                                            <strong>{b.title}</strong>
                                                            <div className="sub-text">
                                                                📍 {b.location || 'Field Zone'} • {b.photoCount || 0} Photos • Client: {b.client?.name || 'Direct Brand'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-teal-600">
                                                                {b.aiSummary?.verificationScore || 98}% Verified
                                                            </span>
                                                            <span className={`status-pill ${b.status}`}>
                                                                {b.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Drawer Super-Admin Action Strip */}
                                <div className="dossier-actions-strip">
                                    <button 
                                        className="btn-dossier-action btn-reassign"
                                        onClick={() => { setPromoterToReassign(selectedDossier.promoter); setTargetManagerId(''); setShowReassignModal(true); }}
                                    >
                                        <HiSwitchHorizontal /> Reassign Agency
                                    </button>
                                    <button 
                                        className="btn-dossier-action btn-impersonate"
                                        onClick={() => handleImpersonate(selectedDossier.promoter)}
                                    >
                                        <HiLogin /> Test Camera as Promoter
                                    </button>
                                    <button 
                                        className="btn-dossier-action"
                                        onClick={() => { setResettingPromoter(selectedDossier.promoter); setNewPassword(''); setShowPasswordModal(true); }}
                                    >
                                        <HiKey /> Reset Password
                                    </button>
                                    <button 
                                        className={`btn-dossier-action ${selectedDossier.promoter.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                                        onClick={() => handleToggleStatus(selectedDossier.promoter)}
                                    >
                                        {selectedDossier.promoter.isActive !== false ? <HiBan /> : <HiCheck />}
                                        {selectedDossier.promoter.isActive !== false ? 'Suspend Promoter' : 'Activate Promoter'}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <style>{`
                .admin-promoters-page {
                    max-width: 1360px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }

                .page-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
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

                .refresh-icon-btn {
                    padding: 9px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                .refresh-icon-btn:hover { color: var(--text-primary); }

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

                .promoter-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .promoter-avatar-badge {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: #0f766e;
                    color: #ffffff;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                    flex-shrink: 0;
                }

                .promoter-title-link {
                    font-weight: 600;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .promoter-title-link:hover {
                    color: #0d9488;
                    text-decoration: underline;
                }

                .promoter-sub-meta {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }

                .agency-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .agency-sub {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .score-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .score-lbl {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                }

                .submission-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .sub-ratio {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .telemetry-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.82rem;
                }

                .device-tag {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                }

                .status-pill {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 700;
                }
                .status-pill.active { background: #f0fdf4; color: #16a34a; }
                .status-pill.suspended { background: #fef2f2; color: #dc2626; }
                .status-pill.approved { background: #f0fdf4; color: #16a34a; }
                .status-pill.pending { background: #fffbeb; color: #b45309; }
                .status-pill.rejected { background: #fef2f2; color: #dc2626; }

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

                .btn-inspect { background: #0f766e; color: #ffffff; border-color: #0f766e; }
                .btn-inspect:hover { background: #115e59; }

                .btn-impersonate { background: #0284c7; color: #ffffff; border-color: #0284c7; }
                .btn-impersonate:hover { background: #0369a1; }

                .btn-deactivate { color: #dc2626; }
                .btn-activate { color: #16a34a; }

                /* ═════ HIGH Z-INDEX MODALS ═════ */
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

                .btn-confirm-primary {
                    padding: 8px 16px;
                    border-radius: 8px;
                    background: #0d9488;
                    border: none;
                    color: #ffffff;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-confirm-primary:hover { background: #0f766e; }

                .btn-confirm-override {
                    padding: 8px 16px;
                    border-radius: 8px;
                    background: #7c3aed;
                    border: none;
                    color: #ffffff;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                /* ═════ DOSSIER DRAWER ═════ */
                .dossier-drawer-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 10000;
                    display: flex;
                    justify-content: flex-end;
                }

                .dossier-drawer-content {
                    background: var(--bg-secondary);
                    border-left: 1px solid var(--border-color);
                    width: min(640px, 95vw);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
                    animation: slideInRight 0.2s ease-out;
                }

                .dossier-header {
                    padding: 18px 22px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: var(--bg-primary);
                }

                .dossier-tag {
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: #0d9488;
                }

                .dossier-header h2 {
                    margin: 2px 0 0 0;
                    font-size: 1.3rem;
                    font-weight: 700;
                }

                .dossier-header p {
                    margin: 2px 0 0 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .dossier-body {
                    padding: 20px;
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .dossier-tabs-strip {
                    display: flex;
                    gap: 6px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 8px;
                    flex-wrap: wrap;
                }

                .dossier-tab-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    background: none;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .dossier-tab-btn.active {
                    background: var(--bg-primary);
                    color: #0d9488;
                }

                .dossier-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .kpi-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 14px;
                    display: flex;
                    flex-direction: column;
                }

                .kpi-lbl {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .kpi-val {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 4px 0 2px 0;
                }

                .kpi-sub {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .dossier-detail-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                }

                .card-sec-title {
                    font-size: 0.92rem;
                    font-weight: 700;
                    margin: 0 0 12px 0;
                }

                .dossier-spec-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px dashed var(--border-color);
                    font-size: 0.88rem;
                }

                .gps-link {
                    color: #0284c7;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    text-decoration: none;
                }

                .gps-link:hover { text-decoration: underline; }

                .dossier-actions-strip {
                    display: flex;
                    gap: 8px;
                    margin-top: 18px;
                    padding-top: 14px;
                    border-top: 1px solid var(--border-color);
                    flex-wrap: wrap;
                }

                .btn-dossier-action {
                    padding: 7px 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }

                .btn-dossier-action.btn-impersonate {
                    background: #0284c7;
                    color: #ffffff;
                    border-color: #0284c7;
                }

                .btn-dossier-action.btn-reassign {
                    background: #0d9488;
                    color: #ffffff;
                    border-color: #0d9488;
                }

                .recent-batch-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 14px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .status-dot.online { background: #16a34a; box-shadow: 0 0 8px #16a34a; }
                .status-dot.offline { background: #94a3b8; }

                .no-data-msg {
                    color: var(--text-secondary);
                    font-size: 0.88rem;
                    text-align: center;
                    padding: 24px 0;
                }
            `}</style>
        </div>
    );
};

export default AdminPromoters;
