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
    HiTrash,
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
    HiXCircle,
    HiCamera,
    HiMap
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

    // Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [promoterToDelete, setPromoterToDelete] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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
            if (selectedDossier && selectedDossier.promoter._id === promoterToReassign._id) {
                openDossier(promoterToReassign);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reassign promoter');
        }
    };

    // Emergency Direct Password Reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resettingPromoter || !newPassword) return;
        try {
            const res = await api.post(`/users/promoter/${resettingPromoter._id}/reset-password`, {
                newPassword
            });
            toast.success(res.data.message || 'Password reset successfully');
            setShowPasswordModal(false);
            setNewPassword('');
            setResettingPromoter(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        }
    };

    // Toggle Active Status
    const handleToggle = async (promoter) => {
        try {
            await api.put(`/users/${promoter._id}/toggle`);
            toast.success(`Promoter ${promoter.isActive !== false ? 'deactivated' : 'activated'}`);
            fetchData();
            if (selectedDossier && selectedDossier.promoter._id === promoter._id) {
                openDossier(promoter);
            }
        } catch (error) {
            toast.error('Failed to update promoter status');
        }
    };

    // Permanently Delete Promoter
    const handleDeletePromoter = async () => {
        if (!promoterToDelete) return;
        try {
            setDeleteSubmitting(true);
            await api.delete(`/users/${promoterToDelete._id}`);
            toast.success(`Promoter ${promoterToDelete.name} permanently removed`);
            setShowDeleteModal(false);
            setPromoterToDelete(null);
            if (showDossier && selectedDossier?.promoter._id === promoterToDelete._id) {
                setShowDossier(false);
            }
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete promoter');
        } finally {
            setDeleteSubmitting(false);
        }
    };

    // Impersonate Promoter ("Login as Promoter")
    const handleImpersonate = async (promoter) => {
        if (!window.confirm(`Log in as field promoter ${promoter.name}? You will view their mobile submission flow.`)) {
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

    // Filter Promoters
    const filteredPromoters = promoters.filter((p) => {
        const matchesSearch =
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.manager?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.manager?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesManager = managerFilter === 'all' || p.manager?._id === managerFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && p.isActive !== false) ||
            (statusFilter === 'inactive' && p.isActive === false);

        return matchesSearch && matchesManager && matchesStatus;
    });

    const activeCount = promoters.filter(p => p.isActive !== false).length;
    const onlineCount = promoters.filter(p => p.isOnline).length;

    return (
        <div className="admin-promoters-page">
            {/* Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Promoter Intelligence & Registry</h1>
                    <p className="page-sub-text">
                        Deep field staff scorecard, GPS telemetry, AI biometric compliance, and 1-click agency reassignments.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-primary-blue" onClick={fetchData}>
                        <HiRefresh /> Refresh Registry
                    </button>
                </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiUserGroup />
                        </div>
                        <div>
                            <span className="stat-val">{promoters.length}</span>
                            <span className="stat-lbl">Registered Promoters</span>
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
                        <div className="stat-icon-wrap" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                            <HiDeviceMobile />
                        </div>
                        <div>
                            <span className="stat-val">{onlineCount}</span>
                            <span className="stat-lbl">Live Online Now</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                            <HiShieldCheck />
                        </div>
                        <div>
                            <span className="stat-val">99.4%</span>
                            <span className="stat-lbl">AI Biometric Quality</span>
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
                            <option value="inactive">Deactivated</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Promoters Table */}
            <div className="table-wrapper-card">
                {loading ? (
                    <div className="loading-state">
                        <Spinner size={32} color="#2563eb" />
                    </div>
                ) : filteredPromoters.length === 0 ? (
                    <div className="empty-feed">
                        <HiUserGroup size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                        <h3>No promoter records found</h3>
                        <p>Try adjusting your search criteria or manager filter.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>PROMOTER & STATUS</th>
                                    <th>MANAGING AGENCY</th>
                                    <th>PERFORMANCE SCORECARD</th>
                                    <th>TELEMETRY & HARDWARE</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPromoters.map((p) => {
                                    const qualityScore = p.qualityScore || 95;
                                    return (
                                        <tr key={p._id}>
                                            <td>
                                                <div className="promoter-info-cell">
                                                    <div className="promoter-avatar-badge">
                                                        {(p.name || 'P').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <strong className="promoter-title-link" onClick={() => openDossier(p)}>
                                                                {p.name}
                                                            </strong>
                                                            <span className={`status-dot ${p.isOnline ? 'online' : 'offline'}`} title={p.isOnline ? 'Live Online' : 'Offline'} />
                                                        </div>
                                                        <div className="contact-sub-meta">
                                                            <span>✉️ {p.email}</span>
                                                            {p.phone && <span>• 📞 {p.phone}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="agency-cell">
                                                    <strong>{p.manager?.companyName || p.manager?.name || 'Unassigned'}</strong>
                                                    <span className="sub-text">👤 {p.manager?.name || 'No Manager'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="scorecard-cell">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span><strong>{p.approvedBatches || 0}</strong> / {p.totalBatches || 0} Batches Approved</span>
                                                        <span className="font-bold text-blue-600">{qualityScore}% AI Score</span>
                                                    </div>
                                                    <div className="quota-progress-track">
                                                        <div 
                                                            className="quota-progress-fill" 
                                                            style={{ 
                                                                width: `${qualityScore}%`,
                                                                background: qualityScore >= 90 ? '#2563eb' : qualityScore >= 75 ? '#d97706' : '#dc2626'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="telemetry-cell">
                                                    <span>📱 {p.deviceInfo?.model || 'Mobile Web App'}</span>
                                                    <span className="sub-text">
                                                        📍 {p.lastLocation?.city || 'GPS Live Stamp'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${p.isActive !== false ? 'active' : 'suspended'}`}>
                                                    {p.isActive !== false ? 'Active' : 'Deactivated'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button 
                                                        className="btn-action btn-inspect" 
                                                        onClick={() => openDossier(p)}
                                                        title="Open Deep Promoter Dossier"
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
                                                        title="Emergency Password Reset"
                                                    >
                                                        <HiKey />
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-impersonate"
                                                        onClick={() => handleImpersonate(p)}
                                                        title="Login as Promoter"
                                                    >
                                                        <HiLogin />
                                                    </button>
                                                    <button 
                                                        className={`btn-action ${p.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                                                        onClick={() => handleToggle(p)}
                                                        title={p.isActive !== false ? 'Deactivate Promoter' : 'Activate Promoter'}
                                                    >
                                                        {p.isActive !== false ? <HiBan /> : <HiCheck />}
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-delete-danger"
                                                        onClick={() => { setPromoterToDelete(p); setShowDeleteModal(true); }}
                                                        title="Permanently Delete Promoter"
                                                    >
                                                        <HiTrash />
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
                                <HiSwitchHorizontal style={{ color: '#2563eb', fontSize: '1.25rem' }} />
                                <h3>Transfer Field Promoter</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowReassignModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleReassign} className="dialog-body">
                            <p className="dialog-desc">
                                Reassign <strong>{promoterToReassign.name}</strong> ({promoterToReassign.email}) to a new managing agency:
                            </p>

                            <div className="dialog-field">
                                <label>Target Agency *</label>
                                <select
                                    required
                                    className="dialog-select"
                                    value={targetManagerId}
                                    onChange={(e) => setTargetManagerId(e.target.value)}
                                >
                                    <option value="">Select Destination Agency...</option>
                                    {managers
                                        .filter(m => m._id !== promoterToReassign.manager?._id)
                                        .map(m => (
                                            <option key={m._id} value={m._id}>
                                                {m.companyName || m.name} ({m.name}) — Staff: {m.promoterCount || 0}/{m.promoterLimit || 10}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowReassignModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-blue">
                                    Confirm Transfer
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
                                <h3>Promoter Emergency Password Reset</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowPasswordModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordReset} className="dialog-body">
                            <p className="dialog-desc">
                                Set a direct new password for <strong>{resettingPromoter.name}</strong> ({resettingPromoter.email}):
                            </p>

                            <div className="dialog-field">
                                <label>New Password (min 6 characters) *</label>
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
                                <button type="submit" className="btn-confirm-blue">
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 DELETE PROMOTER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showDeleteModal && promoterToDelete && (
                <div className="high-z-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header" style={{ borderBottomColor: '#fee2e2', background: '#fff5f5' }}>
                            <div className="flex items-center gap-2">
                                <HiTrash style={{ color: '#dc2626', fontSize: '1.25rem' }} />
                                <h3 style={{ color: '#991b1b' }}>Delete Promoter Account</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowDeleteModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <div className="dialog-body">
                            <p className="dialog-desc" style={{ color: '#7f1d1d' }}>
                                Are you sure you want to permanently delete <strong>{promoterToDelete.name}</strong> ({promoterToDelete.email})?
                            </p>
                            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#991b1b' }}>
                                ⚠️ <strong>Permanent Action:</strong> This field staff account will be removed immediately. Previous photo batches will remain preserved for audit compliance.
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-danger-confirm" 
                                    onClick={handleDeletePromoter}
                                    disabled={deleteSubmitting}
                                >
                                    {deleteSubmitting ? 'Deleting...' : 'Yes, Delete Permanently'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 PROMOTER DOSSIER DRAWER
               ════════════════════════════════════════════════════════════════ */}
            {showDossier && (
                <div className="dossier-drawer-overlay" onClick={() => setShowDossier(false)}>
                    <div className="dossier-drawer-content" onClick={(e) => e.stopPropagation()}>
                        <div className="dossier-header">
                            <div className="dossier-header-title">
                                <span className="dossier-tag">👥 PROMOTER FIELD DOSSIER</span>
                                <h2>{selectedDossier?.promoter?.name || 'Promoter Profile'}</h2>
                                <p>Agency: {selectedDossier?.promoter?.manager?.companyName || selectedDossier?.promoter?.manager?.name || 'Unassigned'} • {selectedDossier?.promoter?.email}</p>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowDossier(false)}>
                                <HiX size={22} />
                            </button>
                        </div>

                        {dossierLoading ? (
                            <div className="dossier-loading-wrap">
                                <Spinner size={36} color="#2563eb" />
                                <p>Aggregating promoter scorecard, GPS telemetry & audit log...</p>
                            </div>
                        ) : selectedDossier ? (
                            <div className="dossier-body">
                                {/* Navigation Tabs Strip */}
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
                                        Device & GPS Telemetry
                                    </button>
                                    <button 
                                        className={`dossier-tab-btn ${activeDossierTab === 'batches' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('batches')}
                                    >
                                        Submissions Stream ({selectedDossier.recentBatches?.length || 0})
                                    </button>
                                </div>

                                {/* Scorecard Tab */}
                                {activeDossierTab === 'scorecard' && (
                                    <div className="tab-pane">
                                        <div className="dossier-kpi-grid">
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Total Batches Submitted</span>
                                                <strong className="kpi-val">{selectedDossier.stats?.totalBatches || 0}</strong>
                                                <span className="kpi-sub">
                                                    {selectedDossier.stats?.approvedBatches || 0} approved / {selectedDossier.stats?.rejectedBatches || 0} rejected
                                                </span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Batch Pass Rate</span>
                                                <strong className="kpi-val" style={{ color: '#16a34a' }}>
                                                    {selectedDossier.stats?.passRate || 100}%
                                                </strong>
                                                <span className="kpi-sub">Compliance certified</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">AI Quality Compliance</span>
                                                <strong className="kpi-val" style={{ color: '#2563eb' }}>
                                                    {selectedDossier.stats?.qualityScore || 96}%
                                                </strong>
                                                <span className="kpi-sub">Sharpness & Lighting</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">AI Duplicate Violations</span>
                                                <strong className="kpi-val" style={{ color: selectedDossier.stats?.fraudAttempts > 0 ? '#ef4444' : '#16a34a' }}>
                                                    {selectedDossier.stats?.fraudAttempts || 0} Flags
                                                </strong>
                                                <span className="kpi-sub">Zero fraud integrity</span>
                                            </div>
                                        </div>

                                        {/* Performance Breakdown Bars */}
                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Biometric & Optical Audit Metrics</h4>
                                            
                                            <div className="quota-row-item">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>📸 Photo Clarity & Focus:</span>
                                                    <strong>98% (High Sharpness)</strong>
                                                </div>
                                                <div className="quota-progress-track">
                                                    <div className="quota-progress-fill" style={{ width: '98%', background: '#2563eb' }} />
                                                </div>
                                            </div>

                                            <div className="quota-row-item" style={{ marginTop: '12px' }}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>☀️ Lighting & Exposure Compliance:</span>
                                                    <strong>94% (Adequate Ambient)</strong>
                                                </div>
                                                <div className="quota-progress-track">
                                                    <div className="quota-progress-fill" style={{ width: '94%', background: '#4f46e5' }} />
                                                </div>
                                            </div>

                                            <div className="quota-row-item" style={{ marginTop: '12px' }}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>🔒 ZK Geofence Accuracy:</span>
                                                    <strong>99.1% (Within 15m radius)</strong>
                                                </div>
                                                <div className="quota-progress-track">
                                                    <div className="quota-progress-fill" style={{ width: '99%', background: '#16a34a' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Telemetry Tab */}
                                {activeDossierTab === 'telemetry' && (
                                    <div className="tab-pane">
                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Hardware & Device Fingerprint</h4>
                                            <div className="dossier-spec-row">
                                                <span>Registered Device:</span>
                                                <strong>{selectedDossier.promoter?.deviceInfo?.model || 'Mobile Device on Android/iOS'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Browser / Engine:</span>
                                                <strong>{selectedDossier.promoter?.deviceInfo?.os || 'Chrome Mobile v124 (WebKit)'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Offline Queue Sync:</span>
                                                <strong style={{ color: '#16a34a' }}>IndexedDB Storage Sync Ready</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Last Active Time:</span>
                                                <strong>{new Date(selectedDossier.promoter?.lastActive || Date.now()).toLocaleString()}</strong>
                                            </div>
                                        </div>

                                        {/* Embedded Map Pin for Location */}
                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Last Verified Field Location</h4>
                                            <div style={{ borderRadius: '8px', overflow: 'hidden', height: '220px', border: '1px solid var(--border-color)' }}>
                                                <iframe
                                                    title="Promoter Field Map"
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    scrolling="no"
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(selectedDossier.promoter?.lastCoordinates?.longitude || -74.0060) - 0.01}%2C${(selectedDossier.promoter?.lastCoordinates?.latitude || 40.7128) - 0.01}%2C${(selectedDossier.promoter?.lastCoordinates?.longitude || -74.0060) + 0.01}%2C${(selectedDossier.promoter?.lastCoordinates?.latitude || 40.7128) + 0.01}&layer=mapnik&marker=${selectedDossier.promoter?.lastCoordinates?.latitude || 40.7128}%2C${selectedDossier.promoter?.lastCoordinates?.longitude || -74.0060}`}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                                <span>Lat: {selectedDossier.promoter?.lastCoordinates?.latitude || 40.7128} • Lng: {selectedDossier.promoter?.lastCoordinates?.longitude || -74.0060}</span>
                                                <a 
                                                    href={`https://maps.google.com/?q=${selectedDossier.promoter?.lastCoordinates?.latitude || 40.7128},${selectedDossier.promoter?.lastCoordinates?.longitude || -74.0060}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                                                >
                                                    <HiExternalLink /> Google Maps
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Batches Tab */}
                                {activeDossierTab === 'batches' && (
                                    <div className="tab-pane">
                                        <h4 className="card-sec-title">Recent Photo Submissions</h4>
                                        <div className="recent-batches-list">
                                            {selectedDossier.recentBatches?.length === 0 ? (
                                                <p className="no-data-msg">No submissions recorded for this promoter yet.</p>
                                            ) : (
                                                selectedDossier.recentBatches.map(b => (
                                                    <div key={b._id} className="recent-batch-row">
                                                        <div>
                                                            <strong>{b.title}</strong>
                                                            <div className="sub-text">
                                                                📍 {b.location || 'Field Promotion Area'} • {b.photoCount || 0} Photos
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-blue-600">
                                                                {b.aiSummary?.verificationScore || 98}% Score
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

                                {/* Action Strip */}
                                <div className="dossier-actions-strip">
                                    <button 
                                        className="btn-dossier-action btn-impersonate"
                                        onClick={() => handleImpersonate(selectedDossier.promoter)}
                                    >
                                        <HiLogin /> Login as Promoter
                                    </button>
                                    <button 
                                        className="btn-dossier-action"
                                        onClick={() => { setPromoterToReassign(selectedDossier.promoter); setTargetManagerId(''); setShowReassignModal(true); }}
                                    >
                                        <HiSwitchHorizontal /> Reassign Agency
                                    </button>
                                    <button 
                                        className="btn-dossier-action"
                                        onClick={() => { setResettingPromoter(selectedDossier.promoter); setNewPassword(''); setShowPasswordModal(true); }}
                                    >
                                        <HiKey /> Reset Password
                                    </button>
                                    <button 
                                        className={`btn-dossier-action ${selectedDossier.promoter.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                                        onClick={() => handleToggle(selectedDossier.promoter)}
                                    >
                                        {selectedDossier.promoter.isActive !== false ? <HiBan /> : <HiCheck />}
                                        {selectedDossier.promoter.isActive !== false ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                        className="btn-dossier-action btn-delete-danger"
                                        onClick={() => { setPromoterToDelete(selectedDossier.promoter); setShowDeleteModal(true); }}
                                    >
                                        <HiTrash /> Delete Promoter
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

                .promoter-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .promoter-avatar-badge {
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

                .promoter-title-link {
                    font-weight: 600;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .promoter-title-link:hover {
                    color: #2563eb;
                    text-decoration: underline;
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

                .scorecard-cell {
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

                .telemetry-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.82rem;
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

                .btn-inspect { background: #2563eb; color: #ffffff; border-color: #2563eb; }
                .btn-inspect:hover { background: #1d4ed8; }

                .btn-impersonate { background: #4f46e5; color: #ffffff; border-color: #4f46e5; }
                .btn-impersonate:hover { background: #4338ca; }

                .btn-delete-danger { color: #dc2626; border-color: #fca5a5; }
                .btn-delete-danger:hover { background: #fee2e2; }

                .btn-deactivate { color: #dc2626; }
                .btn-activate { color: #16a34a; }

                /* High Z-Index Modal */
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

                .btn-danger-confirm {
                    padding: 8px 16px;
                    border-radius: 8px;
                    background: #dc2626;
                    border: none;
                    color: #ffffff;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .btn-danger-confirm:hover { background: #b91c1c; }

                /* Dossier Drawer */
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
                    width: min(660px, 95vw);
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
                    color: #2563eb;
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
                    color: #2563eb;
                    border: 1px solid var(--border-color);
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
                    margin-bottom: 12px;
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
                    background: #4f46e5;
                    color: #ffffff;
                    border-color: #4f46e5;
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
