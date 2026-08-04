import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import { 
    HiPlus, 
    HiOfficeBuilding, 
    HiPencil, 
    HiTrash, 
    HiX, 
    HiBan, 
    HiCheck, 
    HiSearch, 
    HiKey, 
    HiEye, 
    HiShieldCheck, 
    HiUserGroup, 
    HiSparkles, 
    HiDatabase, 
    HiPhone, 
    HiLocationMarker, 
    HiIdentification, 
    HiDocumentReport, 
    HiLogin, 
    HiCheckCircle, 
    HiXCircle, 
    HiExclamation, 
    HiSwitchHorizontal, 
    HiRefresh 
} from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminManagers = () => {
    const { startImpersonation } = useAuth();

    // State
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedManagerIds, setSelectedManagerIds] = useState([]);

    // Modals & Drawers
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDossierDrawer, setShowDossierDrawer] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState(null);
    const [dossierLoading, setDossierLoading] = useState(false);
    const [activeDossierTab, setActiveDossierTab] = useState('overview');

    // Action Modals
    const [showQuotaModal, setShowQuotaModal] = useState(false);
    const [editingManager, setEditingManager] = useState(null);
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [resettingManager, setResettingManager] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    // Reassign Promoter Modal
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [promoterToReassign, setPromoterToReassign] = useState(null);
    const [targetManagerId, setTargetManagerId] = useState('');

    // Form data for creating manager
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        companyName: '',
        phone: '',
        address: '',
        taxId: '',
        licenseTier: 'pro',
        promoterLimit: 10,
        aiScanQuota: 1000,
        storageQuotaMB: 5120,
        adminNotes: '',
    });

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users?role=manager');
            setManagers(res.data.users || []);
        } catch (error) {
            toast.error('Failed to load managers');
        } finally {
            setLoading(false);
        }
    };

    // Open Manager Dossier
    const openDossier = async (manager) => {
        setShowDossierDrawer(true);
        setDossierLoading(true);
        setActiveDossierTab('overview');
        try {
            const res = await api.get(`/users/manager/${manager._id}/dossier`);
            setSelectedDossier(res.data.dossier);
        } catch (error) {
            toast.error('Failed to load manager dossier');
            setShowDossierDrawer(false);
        } finally {
            setDossierLoading(false);
        }
    };

    // Create Manager
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/manager', formData);
            toast.success('Manager created successfully');
            setShowCreateModal(false);
            setFormData({
                email: '',
                password: '',
                name: '',
                companyName: '',
                phone: '',
                address: '',
                taxId: '',
                licenseTier: 'pro',
                promoterLimit: 10,
                aiScanQuota: 1000,
                storageQuotaMB: 5120,
                adminNotes: '',
            });
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create manager');
        }
    };

    // Save Quotas and Tier
    const handleSaveQuota = async (e) => {
        e.preventDefault();
        if (!editingManager) return;
        try {
            await api.put(`/users/manager/${editingManager._id}/quota`, editingManager);
            toast.success('Manager quotas & profile updated');
            setShowQuotaModal(false);
            fetchManagers();
            if (selectedDossier && selectedDossier.manager._id === editingManager._id) {
                openDossier(editingManager);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update quotas');
        }
    };

    // Emergency Direct Password Reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!resettingManager || !newPassword) return;
        try {
            const res = await api.post(`/users/manager/${resettingManager._id}/reset-password`, {
                newPassword,
            });
            toast.success(res.data.message || 'Password reset successfully');
            setShowPasswordResetModal(false);
            setNewPassword('');
            setResettingManager(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password reset failed');
        }
    };

    // Impersonate Manager
    const handleImpersonate = async (manager) => {
        if (!window.confirm(`Are you sure you want to log in as ${manager.name} (${manager.companyName || 'Manager'})?`)) {
            return;
        }
        try {
            const res = await api.post(`/users/impersonate/${manager._id}`);
            startImpersonation(res.data.token, res.data.user);
            toast.success(`Impersonating ${manager.name}. Redirecting...`);
            window.location.href = '/manager';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Impersonation failed');
        }
    };

    // Toggle Active Status
    const handleToggleStatus = async (manager) => {
        try {
            await api.put(`/users/${manager._id}/toggle`);
            toast.success(`Manager ${manager.isActive ? 'deactivated' : 'activated'}`);
            fetchManagers();
            if (selectedDossier && selectedDossier.manager._id === manager._id) {
                openDossier(manager);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Bulk Actions
    const handleBulkAction = async (action, value = null) => {
        if (selectedManagerIds.length === 0) {
            toast.error('Select at least one manager');
            return;
        }
        try {
            await api.post('/users/bulk-action', {
                userIds: selectedManagerIds,
                action,
                value,
            });
            toast.success('Bulk action applied successfully');
            setSelectedManagerIds([]);
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bulk action failed');
        }
    };

    // Reassign Promoter
    const handleReassignPromoter = async (e) => {
        e.preventDefault();
        if (!promoterToReassign || !targetManagerId) return;
        try {
            const res = await api.put(`/users/promoter/${promoterToReassign._id}/reassign`, {
                targetManagerId,
            });
            toast.success(res.data.message || 'Promoter reassigned');
            setShowReassignModal(false);
            setPromoterToReassign(null);
            setTargetManagerId('');
            if (selectedDossier) {
                openDossier(selectedDossier.manager);
            }
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reassign promoter');
        }
    };

    // Filter managers
    const filteredManagers = managers.filter(m => {
        const matchesSearch =
            m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.phone?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTier = tierFilter === 'all' || (m.licenseTier || 'pro') === tierFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && m.isActive !== false) ||
            (statusFilter === 'suspended' && m.isActive === false);

        return matchesSearch && matchesTier && matchesStatus;
    });

    const toggleSelectAll = () => {
        if (selectedManagerIds.length === filteredManagers.length) {
            setSelectedManagerIds([]);
        } else {
            setSelectedManagerIds(filteredManagers.map(m => m._id));
        }
    };

    const toggleSelectOne = (id) => {
        if (selectedManagerIds.includes(id)) {
            setSelectedManagerIds(selectedManagerIds.filter(i => i !== id));
        } else {
            setSelectedManagerIds([...selectedManagerIds, id]);
        }
    };

    const tierBadges = {
        starter: { label: 'Starter', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
        pro: { label: 'Pro Tier', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
        enterprise: { label: 'Enterprise', bg: '#fdf4ff', color: '#9333ea', border: '#f0abfc' },
    };

    return (
        <div className="admin-managers-container">
            {/* Top Header & Metrics */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Enterprise Manager Hub</h1>
                    <p className="page-subtitle">
                        Complete directory, license tiers, real-time dossiers, quotas, and super-admin controls.
                    </p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <HiPlus size={18} /> Add New Manager
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="metrics-strip">
                <div className="metric-chip">
                    <HiOfficeBuilding className="metric-icon" style={{ color: '#0284c7' }} />
                    <div>
                        <span className="metric-num">{managers.length}</span>
                        <span className="metric-lbl">Total Managers</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiCheckCircle className="metric-icon" style={{ color: '#10b981' }} />
                    <div>
                        <span className="metric-num">{managers.filter(m => m.isActive !== false).length}</span>
                        <span className="metric-lbl">Active Accounts</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiUserGroup className="metric-icon" style={{ color: '#8b5cf6' }} />
                    <div>
                        <span className="metric-num">
                            {managers.reduce((acc, m) => acc + (m.promotersCreated || 0), 0)}
                        </span>
                        <span className="metric-lbl">Managed Promoters</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiSparkles className="metric-icon" style={{ color: '#f59e0b' }} />
                    <div>
                        <span className="metric-num">
                            {managers.filter(m => m.licenseTier === 'enterprise').length}
                        </span>
                        <span className="metric-lbl">Enterprise Tiers</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Search, Filters, Bulk Actions */}
            <div className="controls-card">
                <div className="search-filter-row">
                    <div className="search-box">
                        <HiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by manager name, email, company, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <HiX />
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                            <option value="all">All Tiers</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="pro">Pro</option>
                            <option value="starter">Starter</option>
                        </select>

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>

                        <button className="btn btn-ghost refresh-btn" onClick={fetchManagers} title="Refresh list">
                            <HiRefresh size={18} />
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedManagerIds.length > 0 && (
                    <div className="bulk-actions-banner">
                        <span className="bulk-count">
                            <strong>{selectedManagerIds.length}</strong> manager(s) selected
                        </span>
                        <div className="bulk-btn-group">
                            <button
                                className="bulk-btn activate"
                                onClick={() => handleBulkAction('activate')}
                            >
                                <HiCheck size={16} /> Activate
                            </button>
                            <button
                                className="bulk-btn deactivate"
                                onClick={() => handleBulkAction('deactivate')}
                            >
                                <HiBan size={16} /> Deactivate
                            </button>
                            <button
                                className="bulk-btn tier"
                                onClick={() => {
                                    const tier = prompt('Enter tier for selected managers (starter / pro / enterprise):', 'enterprise');
                                    if (tier) handleBulkAction('set_tier', tier.toLowerCase());
                                }}
                            >
                                <HiSparkles size={16} /> Change Tier
                            </button>
                            <button
                                className="bulk-btn clear"
                                onClick={() => setSelectedManagerIds([])}
                            >
                                Deselect
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Managers Table */}
            <div className="table-card">
                {loading ? (
                    <div className="table-loader">
                        <Spinner size={36} color="#0d9488" />
                    </div>
                ) : filteredManagers.length === 0 ? (
                    <div className="empty-state">
                        <HiOfficeBuilding size={48} style={{ color: '#94a3b8' }} />
                        <h3>No managers found</h3>
                        <p>No manager accounts match your search or filters.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="managers-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedManagerIds.length > 0 &&
                                                selectedManagerIds.length === filteredManagers.length
                                            }
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Manager & Company</th>
                                    <th>Tier</th>
                                    <th>Promoter Capacity</th>
                                    <th>AI Quota</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Super Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredManagers.map((manager) => {
                                    const tier = tierBadges[manager.licenseTier || 'pro'] || tierBadges.pro;
                                    const isSelected = selectedManagerIds.includes(manager._id);

                                    return (
                                        <tr key={manager._id} className={isSelected ? 'selected-row' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectOne(manager._id)}
                                                />
                                            </td>
                                            <td>
                                                <div className="manager-cell">
                                                    <div className="avatar-box">
                                                        {manager.name?.[0]?.toUpperCase() || 'M'}
                                                    </div>
                                                    <div>
                                                        <div className="manager-name-row">
                                                            <strong 
                                                                className="manager-link"
                                                                onClick={() => openDossier(manager)}
                                                                title="View Full Dossier"
                                                            >
                                                                {manager.name}
                                                            </strong>
                                                        </div>
                                                        <div className="manager-meta">
                                                            <span>{manager.email}</span>
                                                            {manager.companyName && (
                                                                <span className="company-tag">
                                                                    🏢 {manager.companyName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span 
                                                    className="tier-pill"
                                                    style={{
                                                        backgroundColor: tier.bg,
                                                        color: tier.color,
                                                        borderColor: tier.border,
                                                    }}
                                                >
                                                    {tier.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="capacity-bar-wrapper">
                                                    <div className="capacity-numbers">
                                                        <span>{manager.promotersCreated || 0} / {manager.promoterLimit || 5}</span>
                                                        <span className="capacity-percent">
                                                            {Math.min(100, Math.round(((manager.promotersCreated || 0) / (manager.promoterLimit || 5)) * 100))}%
                                                        </span>
                                                    </div>
                                                    <div className="progress-track">
                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${Math.min(100, ((manager.promotersCreated || 0) / (manager.promoterLimit || 5)) * 100)}%`,
                                                                backgroundColor: (manager.promotersCreated || 0) >= (manager.promoterLimit || 5) ? '#ef4444' : '#0d9488'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ai-quota-badge">
                                                    <HiSparkles size={14} style={{ color: '#8b5cf6' }} />
                                                    <span>{manager.aiScanQuota || 1000} scans/mo</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${manager.isActive !== false ? 'active' : 'suspended'}`}>
                                                    {manager.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons-cell">
                                                    <button
                                                        className="action-btn dossier"
                                                        onClick={() => openDossier(manager)}
                                                        title="Open Manager Dossier"
                                                    >
                                                        <HiEye size={16} /> Dossier
                                                    </button>
                                                    <button
                                                        className="action-btn quota"
                                                        onClick={() => {
                                                            setEditingManager({ ...manager });
                                                            setShowQuotaModal(true);
                                                        }}
                                                        title="Edit Limits & Quotas"
                                                    >
                                                        <HiPencil size={15} />
                                                    </button>
                                                    <button
                                                        className="action-btn reset"
                                                        onClick={() => {
                                                            setResettingManager(manager);
                                                            setShowPasswordResetModal(true);
                                                        }}
                                                        title="Emergency Password Reset"
                                                    >
                                                        <HiKey size={15} />
                                                    </button>
                                                    <button
                                                        className="action-btn impersonate"
                                                        onClick={() => handleImpersonate(manager)}
                                                        title="Log in as Manager (Impersonate)"
                                                    >
                                                        <HiLogin size={16} />
                                                    </button>
                                                    <button
                                                        className={`action-btn toggle ${manager.isActive !== false ? 'danger' : 'success'}`}
                                                        onClick={() => handleToggleStatus(manager)}
                                                        title={manager.isActive !== false ? 'Suspend Account' : 'Activate Account'}
                                                    >
                                                        {manager.isActive !== false ? <HiBan size={15} /> : <HiCheck size={15} />}
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
                 MANAGER DOSSIER SLIDE-OVER DRAWER
               ════════════════════════════════════════════════════════════════ */}
            {showDossierDrawer && (
                <div className="dossier-drawer-backdrop" onClick={() => setShowDossierDrawer(false)}>
                    <div className="dossier-drawer" onClick={(e) => e.stopPropagation()}>
                        {/* Drawer Header */}
                        <div className="drawer-header">
                            <div>
                                <span className="drawer-badge">SUPER ADMIN DOSSIER</span>
                                <h2 className="drawer-title">{selectedDossier?.manager?.name || 'Loading Manager...'}</h2>
                                <p className="drawer-subtitle">
                                    {selectedDossier?.manager?.companyName || 'Agency / Independent'} • {selectedDossier?.manager?.email}
                                </p>
                            </div>
                            <div className="drawer-header-actions">
                                {selectedDossier?.manager && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleImpersonate(selectedDossier.manager)}
                                    >
                                        <HiLogin size={16} /> Impersonate
                                    </button>
                                )}
                                <button className="close-drawer-btn" onClick={() => setShowDossierDrawer(false)}>
                                    <HiX size={20} />
                                </button>
                            </div>
                        </div>

                        {dossierLoading ? (
                            <div className="drawer-loading">
                                <Spinner size={40} color="#0d9488" />
                                <p>Generating comprehensive manager audit dossier...</p>
                            </div>
                        ) : selectedDossier ? (
                            <>
                                {/* Drawer Navigation Tabs */}
                                <div className="drawer-tabs">
                                    <button
                                        className={`drawer-tab ${activeDossierTab === 'overview' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('overview')}
                                    >
                                        <HiIdentification size={16} /> Overview
                                    </button>
                                    <button
                                        className={`drawer-tab ${activeDossierTab === 'promoters' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('promoters')}
                                    >
                                        <HiUserGroup size={16} /> Promoters ({selectedDossier.promoters?.length || 0})
                                    </button>
                                    <button
                                        className={`drawer-tab ${activeDossierTab === 'clients' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('clients')}
                                    >
                                        <HiOfficeBuilding size={16} /> Clients ({selectedDossier.clients?.length || 0})
                                    </button>
                                    <button
                                        className={`drawer-tab ${activeDossierTab === 'fraud' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('fraud')}
                                    >
                                        <HiShieldCheck size={16} /> Batches & AI Fraud Audit
                                    </button>
                                    <button
                                        className={`drawer-tab ${activeDossierTab === 'license' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('license')}
                                    >
                                        <HiDatabase size={16} /> Quotas & Tier
                                    </button>
                                </div>

                                {/* Drawer Body Content */}
                                <div className="drawer-body">
                                    {/* TAB 1: OVERVIEW */}
                                    {activeDossierTab === 'overview' && (
                                        <div className="dossier-tab-pane">
                                            {/* Key Metric Highlights */}
                                            <div className="dossier-stats-grid">
                                                <div className="dossier-stat-box">
                                                    <span className="lbl">Total Batches</span>
                                                    <strong className="val">{selectedDossier.metrics.totalBatches}</strong>
                                                    <span className="sub">{selectedDossier.metrics.totalPhotos} Photos Total</span>
                                                </div>
                                                <div className="dossier-stat-box">
                                                    <span className="lbl">Approval Rate</span>
                                                    <strong className="val" style={{ color: '#10b981' }}>
                                                        {selectedDossier.metrics.passRate}%
                                                    </strong>
                                                    <span className="sub">{selectedDossier.metrics.statusMap.approved} Approved</span>
                                                </div>
                                                <div className="dossier-stat-box">
                                                    <span className="lbl">Fraud Prevented</span>
                                                    <strong className="val" style={{ color: '#f59e0b' }}>
                                                        {selectedDossier.metrics.totalDuplicatesCaught}
                                                    </strong>
                                                    <span className="sub">Duplicate attempts blocked</span>
                                                </div>
                                                <div className="dossier-stat-box">
                                                    <span className="lbl">Faces Protected</span>
                                                    <strong className="val" style={{ color: '#6366f1' }}>
                                                        {selectedDossier.metrics.totalFacesProtected}
                                                    </strong>
                                                    <span className="sub">Privacy blurred</span>
                                                </div>
                                            </div>

                                            {/* Profile Card */}
                                            <div className="dossier-section-card">
                                                <h4 className="card-heading">
                                                    <HiIdentification size={18} /> Enterprise Profile & Verification
                                                </h4>
                                                <div className="info-grid">
                                                    <div className="info-row">
                                                        <span className="info-label">Company Name:</span>
                                                        <span className="info-value">{selectedDossier.manager.companyName || 'Not Provided'}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Contact Phone:</span>
                                                        <span className="info-value">
                                                            {selectedDossier.manager.phone ? (
                                                                <a href={`tel:${selectedDossier.manager.phone}`}>📞 {selectedDossier.manager.phone}</a>
                                                            ) : 'Not Provided'}
                                                        </span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Headquarters / Address:</span>
                                                        <span className="info-value">{selectedDossier.manager.address || 'Not Provided'}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Business / Tax ID:</span>
                                                        <span className="info-value">{selectedDossier.manager.taxId || 'Not Provided'}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">License Tier:</span>
                                                        <span className="info-value">
                                                            <strong style={{ textTransform: 'capitalize' }}>
                                                                {selectedDossier.manager.licenseTier || 'Pro'}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-label">Account Joined:</span>
                                                        <span className="info-value">
                                                            {new Date(selectedDossier.manager.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Admin Notes */}
                                            <div className="dossier-section-card">
                                                <h4 className="card-heading">
                                                    <HiDocumentReport size={18} /> Super Admin Internal Notes
                                                </h4>
                                                <p className="admin-notes-display">
                                                    {selectedDossier.manager.adminNotes || 'No internal notes recorded for this manager.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB 2: PROMOTERS REGISTRY */}
                                    {activeDossierTab === 'promoters' && (
                                        <div className="dossier-tab-pane">
                                            <div className="pane-header-row">
                                                <h4>Managed Promoters ({selectedDossier.promoters.length})</h4>
                                                <span className="pane-meta">
                                                    Capacity: {selectedDossier.promoters.length} / {selectedDossier.manager.promoterLimit}
                                                </span>
                                            </div>

                                            {selectedDossier.promoters.length === 0 ? (
                                                <div className="empty-subpane">
                                                    <HiUserGroup size={36} />
                                                    <p>This manager has not onboarded any promoters yet.</p>
                                                </div>
                                            ) : (
                                                <div className="promoters-sublist">
                                                    {selectedDossier.promoters.map((p) => (
                                                        <div key={p._id} className="promoter-dossier-card">
                                                            <div className="p-card-left">
                                                                <div className={`status-dot ${p.isOnline ? 'online' : 'offline'}`} title={p.isOnline ? 'Active within last 15m' : 'Offline'} />
                                                                <div>
                                                                    <strong className="p-name">{p.name}</strong>
                                                                    <span className="p-email">{p.email}</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-card-stats">
                                                                <span className="p-stat">
                                                                    📦 {p.stats.totalBatches} Batches ({p.stats.approvedBatches} Approved)
                                                                </span>
                                                                <span className="p-stat">
                                                                    📸 {p.stats.photos} Photos
                                                                </span>
                                                            </div>
                                                            <div className="p-card-actions">
                                                                <button
                                                                    className="btn-reassign"
                                                                    onClick={() => {
                                                                        setPromoterToReassign(p);
                                                                        setShowReassignModal(true);
                                                                    }}
                                                                    title="Transfer promoter to another manager"
                                                                >
                                                                    <HiSwitchHorizontal size={14} /> Reassign
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB 3: CLIENTS */}
                                    {activeDossierTab === 'clients' && (
                                        <div className="dossier-tab-pane">
                                            <div className="pane-header-row">
                                                <h4>Client Accounts ({selectedDossier.clients.length})</h4>
                                            </div>

                                            {selectedDossier.clients.length === 0 ? (
                                                <div className="empty-subpane">
                                                    <HiOfficeBuilding size={36} />
                                                    <p>No client profiles created by this manager.</p>
                                                </div>
                                            ) : (
                                                <div className="clients-sublist">
                                                    {selectedDossier.clients.map((c) => (
                                                        <div key={c._id} className="client-dossier-card">
                                                            <div>
                                                                <strong className="c-name">{c.name}</strong>
                                                                <span className="c-contact">
                                                                    {c.contactPerson ? `Contact: ${c.contactPerson}` : ''} {c.contactEmail ? `(${c.contactEmail})` : ''}
                                                                </span>
                                                            </div>
                                                            <span className="c-industry">
                                                                {c.industry || 'General Retail'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB 4: BATCHES & AI FRAUD AUDIT */}
                                    {activeDossierTab === 'fraud' && (
                                        <div className="dossier-tab-pane">
                                            <div className="pane-header-row">
                                                <h4>Batches & AI Security Stream</h4>
                                            </div>

                                            <div className="fraud-summary-banner">
                                                <div>
                                                    <strong>AI Integrity Score:</strong>
                                                    <span> 99.4% Authenticity Verified</span>
                                                </div>
                                                <div className="fraud-counts">
                                                    <span>⚠️ {selectedDossier.metrics.totalDuplicatesCaught} Duplicates Caught</span>
                                                    <span>🛡️ {selectedDossier.metrics.totalFacesProtected} Faces Secured</span>
                                                </div>
                                            </div>

                                            <h5 className="subhead">Recent Submissions</h5>
                                            {selectedDossier.recentBatches?.length === 0 ? (
                                                <p className="empty-text">No recent batches submitted.</p>
                                            ) : (
                                                <div className="recent-batches-list">
                                                    {selectedDossier.recentBatches.map((b) => (
                                                        <div key={b._id} className="recent-batch-card">
                                                            <div>
                                                                <strong className="b-title">{b.title}</strong>
                                                                <div className="b-meta">
                                                                    <span>Promoter: {b.promoter?.name || 'Unknown'}</span>
                                                                    <span> • 📸 {b.photoCount} Photos</span>
                                                                </div>
                                                            </div>
                                                            <span className={`b-status ${b.status}`}>
                                                                {b.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB 5: LICENSE & QUOTAS */}
                                    {activeDossierTab === 'license' && (
                                        <div className="dossier-tab-pane">
                                            <form onSubmit={handleSaveQuota} className="quota-edit-form">
                                                <div className="form-group">
                                                    <label>License Tier</label>
                                                    <select
                                                        value={selectedDossier.manager.licenseTier || 'pro'}
                                                        onChange={(e) => {
                                                            setSelectedDossier({
                                                                ...selectedDossier,
                                                                manager: { ...selectedDossier.manager, licenseTier: e.target.value }
                                                            });
                                                            setEditingManager({
                                                                ...selectedDossier.manager,
                                                                licenseTier: e.target.value
                                                            });
                                                        }}
                                                    >
                                                        <option value="starter">Starter Tier</option>
                                                        <option value="pro">Pro Agency Tier</option>
                                                        <option value="enterprise">Enterprise VIP Tier</option>
                                                    </select>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Promoter Capacity Limit</label>
                                                        <input
                                                            type="number"
                                                            value={selectedDossier.manager.promoterLimit || 5}
                                                            onChange={(e) => {
                                                                setSelectedDossier({
                                                                    ...selectedDossier,
                                                                    manager: { ...selectedDossier.manager, promoterLimit: e.target.value }
                                                                });
                                                                setEditingManager({
                                                                    ...selectedDossier.manager,
                                                                    promoterLimit: e.target.value
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Monthly AI Scan Quota</label>
                                                        <input
                                                            type="number"
                                                            value={selectedDossier.manager.aiScanQuota || 1000}
                                                            onChange={(e) => {
                                                                setSelectedDossier({
                                                                    ...selectedDossier,
                                                                    manager: { ...selectedDossier.manager, aiScanQuota: e.target.value }
                                                                });
                                                                setEditingManager({
                                                                    ...selectedDossier.manager,
                                                                    aiScanQuota: e.target.value
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-group">
                                                    <label>Admin Internal Notes</label>
                                                    <textarea
                                                        rows={3}
                                                        value={selectedDossier.manager.adminNotes || ''}
                                                        placeholder="Notes visible only to Super Admin..."
                                                        onChange={(e) => {
                                                            setSelectedDossier({
                                                                ...selectedDossier,
                                                                manager: { ...selectedDossier.manager, adminNotes: e.target.value }
                                                            });
                                                            setEditingManager({
                                                                ...selectedDossier.manager,
                                                                adminNotes: e.target.value
                                                            });
                                                        }}
                                                    />
                                                </div>

                                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                                    Save Quotas & Tier Updates
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 CREATE MANAGER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Enterprise Manager Account</h3>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="admin-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Manager Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Alex Morgan"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company / Agency Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Horizon Brand Activations"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="alex@agency.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Temporary Password *</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input
                                        type="text"
                                        placeholder="+1 (555) 019-2834"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Business / Tax ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. US-EIN-9283741"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>License Tier</label>
                                    <select
                                        value={formData.licenseTier}
                                        onChange={(e) => setFormData({ ...formData, licenseTier: e.target.value })}
                                    >
                                        <option value="starter">Starter (5 Promoters)</option>
                                        <option value="pro">Pro Agency (15 Promoters)</option>
                                        <option value="enterprise">Enterprise (Unlimited / Custom)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Promoter Capacity Limit</label>
                                    <input
                                        type="number"
                                        value={formData.promoterLimit}
                                        onChange={(e) => setFormData({ ...formData, promoterLimit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Headquarters / Office Address</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 450 Lexington Ave, New York, NY"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Manager Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 EMERGENCY PASSWORD RESET MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showPasswordResetModal && resettingManager && (
                <div className="modal-overlay" onClick={() => setShowPasswordResetModal(false)}>
                    <div className="modal-content sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><HiKey /> Emergency Password Override</h3>
                            <button className="close-btn" onClick={() => setShowPasswordResetModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordReset} className="admin-form">
                            <p className="modal-description">
                                Directly set a new password for <strong>{resettingManager.name}</strong> ({resettingManager.email}). This overrides their current password immediately.
                            </p>
                            <div className="form-group">
                                <label>New Password *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter new password (min 6 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordResetModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary danger">
                                    Apply New Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 REASSIGN PROMOTER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showReassignModal && promoterToReassign && (
                <div className="modal-overlay" onClick={() => setShowReassignModal(false)}>
                    <div className="modal-content sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><HiSwitchHorizontal /> Reassign Promoter</h3>
                            <button className="close-btn" onClick={() => setShowReassignModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleReassignPromoter} className="admin-form">
                            <p className="modal-description">
                                Transfer promoter <strong>{promoterToReassign.name}</strong> ({promoterToReassign.email}) to a new manager:
                            </p>
                            <div className="form-group">
                                <label>Select Destination Manager *</label>
                                <select
                                    required
                                    value={targetManagerId}
                                    onChange={(e) => setTargetManagerId(e.target.value)}
                                >
                                    <option value="">Choose Manager...</option>
                                    {managers
                                        .filter(m => m._id !== promoterToReassign.createdBy)
                                        .map(m => (
                                            <option key={m._id} value={m._id}>
                                                {m.name} ({m.companyName || 'No Company'}) - {m.promotersCreated || 0}/{m.promoterLimit || 5} capacity
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowReassignModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Transfer Promoter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 EDIT QUOTA & TIER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showQuotaModal && editingManager && (
                <div className="modal-overlay" onClick={() => setShowQuotaModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Edit Quotas & Tier: {editingManager.name}</h3>
                            <button className="close-btn" onClick={() => setShowQuotaModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleSaveQuota} className="admin-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>License Tier</label>
                                    <select
                                        value={editingManager.licenseTier || 'pro'}
                                        onChange={(e) => setEditingManager({ ...editingManager, licenseTier: e.target.value })}
                                    >
                                        <option value="starter">Starter</option>
                                        <option value="pro">Pro Agency</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Promoter Limit</label>
                                    <input
                                        type="number"
                                        value={editingManager.promoterLimit || 5}
                                        onChange={(e) => setEditingManager({ ...editingManager, promoterLimit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Monthly AI Scan Quota</label>
                                    <input
                                        type="number"
                                        value={editingManager.aiScanQuota || 1000}
                                        onChange={(e) => setEditingManager({ ...editingManager, aiScanQuota: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Storage Limit (MB)</label>
                                    <input
                                        type="number"
                                        value={editingManager.storageQuotaMB || 5120}
                                        onChange={(e) => setEditingManager({ ...editingManager, storageQuotaMB: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    value={editingManager.companyName || ''}
                                    onChange={(e) => setEditingManager({ ...editingManager, companyName: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowQuotaModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .admin-managers-container {
                    max-width: 1320px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .page-title {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                    letter-spacing: -0.02em;
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    margin: 0;
                }

                .metrics-strip {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .metric-chip {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
                }

                .metric-icon {
                    font-size: 2rem;
                }

                .metric-num {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1.1;
                }

                .metric-lbl {
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                }

                .controls-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    padding: 16px 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
                }

                .search-filter-row {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .search-box {
                    flex: 1;
                    min-width: 260px;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-icon {
                    position: absolute;
                    left: 14px;
                    color: var(--text-secondary);
                    font-size: 1.1rem;
                }

                .search-box input {
                    width: 100%;
                    padding: 10px 38px;
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.92rem;
                }

                .clear-search {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .filter-group {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .filter-group select {
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                }

                .refresh-btn {
                    padding: 10px;
                    border-radius: 10px;
                }

                .bulk-actions-banner {
                    margin-top: 14px;
                    padding-top: 14px;
                    border-top: 1px dashed var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .bulk-count {
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }

                .bulk-btn-group {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .bulk-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bulk-btn.activate { background: #dcfce7; color: #166534; }
                .bulk-btn.deactivate { background: #fee2e2; color: #991b1b; }
                .bulk-btn.tier { background: #f3e8ff; color: #7e22ce; }
                .bulk-btn.clear { background: var(--bg-primary); color: var(--text-secondary); border: 1px solid var(--border-color); }

                .table-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    overflow: hidden;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                }

                .table-responsive {
                    overflow-x: auto;
                }

                .managers-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .managers-table th {
                    padding: 14px 18px;
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    border-bottom: 1px solid var(--border-color);
                }

                .managers-table td {
                    padding: 16px 18px;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.92rem;
                    color: var(--text-primary);
                    vertical-align: middle;
                }

                .managers-table tr:hover {
                    background: rgba(0, 102, 204, 0.02);
                }

                .managers-table tr.selected-row {
                    background: rgba(13, 148, 136, 0.06);
                }

                .manager-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .avatar-box {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #0d9488, #0284c7);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .manager-name-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .manager-link {
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .manager-link:hover {
                    color: #0d9488;
                    text-decoration: underline;
                }

                .manager-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                    margin-top: 2px;
                }

                .company-tag {
                    color: #0284c7;
                    font-weight: 600;
                }

                .tier-pill {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    border: 1px solid;
                }

                .capacity-bar-wrapper {
                    min-width: 140px;
                }

                .capacity-numbers {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .capacity-percent {
                    color: var(--text-secondary);
                }

                .progress-track {
                    height: 6px;
                    border-radius: 6px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 6px;
                    transition: width 0.3s ease;
                }

                .ai-quota-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #6d28d9;
                    background: #f5f3ff;
                    padding: 4px 10px;
                    border-radius: 8px;
                }

                .status-pill {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 700;
                }

                .status-pill.active {
                    background: #dcfce7;
                    color: #15803d;
                }

                .status-pill.suspended {
                    background: #fee2e2;
                    color: #b91c1c;
                }

                .action-buttons-cell {
                    display: flex;
                    gap: 6px;
                    justify-content: flex-end;
                }

                .action-btn {
                    padding: 6px 10px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: var(--bg-secondary);
                    transform: translateY(-1px);
                }

                .action-btn.dossier {
                    background: #0d9488;
                    color: #ffffff;
                    border-color: #0d9488;
                }

                .action-btn.impersonate {
                    background: #0284c7;
                    color: #ffffff;
                    border-color: #0284c7;
                }

                .action-btn.toggle.danger {
                    color: #dc2626;
                }

                .action-btn.toggle.success {
                    color: #16a34a;
                }

                /* ═════ DOSSIER SLIDE-OVER DRAWER ═════ */
                .dossier-drawer-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.45);
                    backdrop-filter: blur(4px);
                    z-index: 9999;
                    display: flex;
                    justify-content: flex-end;
                }

                .dossier-drawer {
                    width: min(720px, 95vw);
                    height: 100vh;
                    background: var(--bg-secondary);
                    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .drawer-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: var(--bg-primary);
                }

                .drawer-badge {
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    color: #0d9488;
                    display: block;
                    margin-bottom: 4px;
                }

                .drawer-title {
                    font-size: 1.4rem;
                    font-weight: 800;
                    margin: 0;
                    color: var(--text-primary);
                }

                .drawer-subtitle {
                    margin: 4px 0 0 0;
                    color: var(--text-secondary);
                    font-size: 0.88rem;
                }

                .drawer-header-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .close-drawer-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .drawer-tabs {
                    display: flex;
                    overflow-x: auto;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    padding: 0 16px;
                }

                .drawer-tab {
                    padding: 12px 16px;
                    border: none;
                    background: none;
                    color: var(--text-secondary);
                    font-size: 0.88rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border-bottom: 2px solid transparent;
                    white-space: nowrap;
                }

                .drawer-tab.active {
                    color: #0d9488;
                    border-bottom-color: #0d9488;
                }

                .drawer-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .dossier-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 14px;
                    margin-bottom: 24px;
                }

                .dossier-stat-box {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                }

                .dossier-stat-box .lbl {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .dossier-stat-box .val {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 4px 0 2px 0;
                }

                .dossier-stat-box .sub {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }

                .dossier-section-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 18px;
                }

                .card-heading {
                    margin: 0 0 14px 0;
                    font-size: 1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-primary);
                }

                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.88rem;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--border-color);
                }

                .info-label {
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .info-value {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .admin-notes-display {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin: 0;
                    font-style: italic;
                }

                .promoter-dossier-card, .client-dossier-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 14px 16px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                }

                .p-card-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .status-dot.online { background: #10b981; box-shadow: 0 0 8px #10b981; }
                .status-dot.offline { background: #94a3b8; }

                .p-name { display: block; font-size: 0.92rem; }
                .p-email { font-size: 0.78rem; color: var(--text-secondary); }

                .p-card-stats {
                    display: flex;
                    flex-direction: column;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .btn-reassign {
                    background: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .fraud-summary-banner {
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                    padding: 14px 18px;
                    border-radius: 10px;
                    color: #92400e;
                    margin-bottom: 18px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                }

                .recent-batch-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 12px 16px;
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .b-title { font-size: 0.9rem; display: block; }
                .b-meta { font-size: 0.78rem; color: var(--text-secondary); }
                .b-status { font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
                .b-status.approved { background: #dcfce7; color: #166534; }
                .b-status.pending { background: #fef9c3; color: #854d0e; }
                .b-status.rejected { background: #fee2e2; color: #991b1b; }
                .b-status.draft { background: #f1f5f9; color: #475569; }

                /* ═════ MODAL STYLING ═════ */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                }

                .modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-content.sm { max-width: 440px; }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .admin-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .form-group input, .form-group select, .form-group textarea {
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.92rem;
                }

                .modal-description {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin: 0 0 12px 0;
                    line-height: 1.4;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 10px;
                }

                .btn-primary.danger {
                    background: #dc2626;
                }

                .table-loader, .drawer-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    padding: 60px 20px;
                    color: var(--text-secondary);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
};

export default AdminManagers;
