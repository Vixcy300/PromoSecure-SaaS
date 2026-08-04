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
    HiRefresh,
    HiClock
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

    // Reassign Single Promoter
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

    // Impersonate Manager ("Login as Manager")
    const handleImpersonate = async (manager) => {
        if (!window.confirm(`Log in as ${manager.name}? You will view the application exactly as this company sees it.`)) {
            return;
        }
        try {
            const res = await api.post(`/users/impersonate/${manager._id}`);
            startImpersonation(res.data.token, res.data.user);
            toast.success(`Logged in as ${manager.name}. Redirecting to Manager Dashboard...`);
            window.location.href = '/manager';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Impersonation failed');
        }
    };

    // Toggle Active Status
    const handleToggle = async (manager) => {
        try {
            await api.put(`/users/${manager._id}/toggle`);
            toast.success(`Manager ${manager.isActive !== false ? 'deactivated' : 'activated'}`);
            fetchManagers();
            if (selectedDossier && selectedDossier.manager._id === manager._id) {
                openDossier(manager);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Filter Logic
    const filteredManagers = managers.filter((m) => {
        const matchesSearch =
            m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.phone?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTier = tierFilter === 'all' || (m.licenseTier || 'starter') === tierFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && m.isActive !== false) ||
            (statusFilter === 'inactive' && m.isActive === false);

        return matchesSearch && matchesTier && matchesStatus;
    });

    const activeCount = managers.filter(m => m.isActive !== false).length;
    const totalPromoters = managers.reduce((acc, m) => acc + (m.promoterCount || 0), 0);
    const enterpriseCount = managers.filter(m => m.licenseTier === 'enterprise').length;

    return (
        <div className="admin-managers-page">
            {/* Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Enterprise Manager Hub</h1>
                    <p className="page-sub-text">
                        Directory of company managers, license tiers, dossiers, quotas, and super-admin controls.
                    </p>
                </div>
                <button className="btn-primary-header" onClick={() => setShowCreateModal(true)}>
                    <HiPlus size={16} /> Add New Manager
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                            <HiOfficeBuilding />
                        </div>
                        <div>
                            <span className="stat-val">{managers.length}</span>
                            <span className="stat-lbl">Total Managers</span>
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
                            <span className="stat-lbl">Active Accounts</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#7c3aed', background: '#f5f3ff' }}>
                            <HiUserGroup />
                        </div>
                        <div>
                            <span className="stat-val">{totalPromoters}</span>
                            <span className="stat-lbl">Managed Promoters</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#d97706', background: '#fffbeb' }}>
                            <HiSparkles />
                        </div>
                        <div>
                            <span className="stat-val">{enterpriseCount}</span>
                            <span className="stat-lbl">Enterprise Tiers</span>
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
                            placeholder="Search by manager name, email, company, or phone..."
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
                        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="clean-select">
                            <option value="all">All Tiers</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro Tier</option>
                            <option value="enterprise">Enterprise</option>
                        </select>

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="clean-select">
                            <option value="all">All Status</option>
                            <option value="active">Active Accounts</option>
                            <option value="inactive">Suspended</option>
                        </select>

                        <button type="button" className="refresh-icon-btn" onClick={fetchManagers} title="Refresh List">
                            <HiRefresh />
                        </button>
                    </div>
                </div>
            </div>

            {/* Managers Table */}
            <div className="table-wrapper-card">
                {loading ? (
                    <div className="loading-state">
                        <Spinner size={32} color="#0f766e" />
                    </div>
                ) : filteredManagers.length === 0 ? (
                    <div className="empty-feed">
                        <HiOfficeBuilding size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                        <h3>No managers found</h3>
                        <p>No manager profiles match the selected criteria.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>MANAGER & COMPANY</th>
                                    <th>TIER</th>
                                    <th>PROMOTER CAPACITY</th>
                                    <th>AI QUOTA</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>SUPER ADMIN ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredManagers.map((m) => {
                                    const tier = m.licenseTier || 'starter';
                                    const count = m.promoterCount || 0;
                                    const limit = m.promoterLimit || 5;
                                    const pct = Math.min(Math.round((count / limit) * 100), 100);

                                    return (
                                        <tr key={m._id}>
                                            <td>
                                                <div className="manager-info-cell">
                                                    <div className="manager-avatar-badge">
                                                        {m.name ? m.name.charAt(0).toUpperCase() : 'M'}
                                                    </div>
                                                    <div>
                                                        <strong className="manager-title-link" onClick={() => openDossier(m)}>
                                                            {m.name}
                                                        </strong>
                                                        <div className="manager-sub-meta">
                                                            <span>{m.email}</span>
                                                            {m.companyName && (
                                                                <span className="company-pill">
                                                                    🏢 {m.companyName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`tier-badge ${tier}`}>
                                                    {tier.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="capacity-cell">
                                                    <div className="cap-nums">
                                                        <span>{count} / {limit}</span>
                                                        <span className="cap-pct">{pct}%</span>
                                                    </div>
                                                    <div className="cap-track">
                                                        <div className={`cap-fill ${pct >= 90 ? 'danger' : ''}`} style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="quota-cell">
                                                    <strong>{(m.aiScanQuota || 100).toLocaleString()}</strong>
                                                    <span className="quota-unit">scans / mo</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${m.isActive !== false ? 'active' : 'suspended'}`}>
                                                    {m.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="btn-action btn-inspect"
                                                        onClick={() => openDossier(m)}
                                                        title="Open Manager Dossier"
                                                    >
                                                        <HiEye /> Dossier
                                                    </button>
                                                    <button
                                                        className="btn-action btn-secondary-act"
                                                        onClick={() => { setEditingManager({ ...m }); setShowQuotaModal(true); }}
                                                        title="Edit Quotas & Tier"
                                                    >
                                                        <HiPencil />
                                                    </button>
                                                    <button
                                                        className="btn-action btn-secondary-act"
                                                        onClick={() => { setResettingManager(m); setNewPassword(''); setShowPasswordResetModal(true); }}
                                                        title="Direct Password Reset"
                                                    >
                                                        <HiKey />
                                                    </button>
                                                    <button
                                                        className="btn-action btn-impersonate"
                                                        onClick={() => handleImpersonate(m)}
                                                        title="Login as Manager (Impersonate)"
                                                    >
                                                        <HiLogin />
                                                    </button>
                                                    <button
                                                        className={`btn-action ${m.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                                                        onClick={() => handleToggle(m)}
                                                        title={m.isActive !== false ? 'Suspend Account' : 'Activate Account'}
                                                    >
                                                        {m.isActive !== false ? <HiBan /> : <HiCheck />}
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
                 CREATE MANAGER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showCreateModal && (
                <div className="high-z-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="popup-dialog lg" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiPlus style={{ color: '#0d9488', fontSize: '1.25rem' }} />
                                <h3>Create New Company Manager</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowCreateModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="dialog-body">
                            <div className="form-grid-2">
                                <div className="dialog-field">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="dialog-input"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Work Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        className="dialog-input"
                                        placeholder="manager@agency.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="dialog-field">
                                    <label>Temporary Password *</label>
                                    <input
                                        type="password"
                                        required
                                        className="dialog-input"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Company / Agency Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="dialog-input"
                                        placeholder="Acme Promotions Ltd."
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-grid-3">
                                <div className="dialog-field">
                                    <label>License Tier</label>
                                    <select
                                        className="dialog-select"
                                        value={formData.licenseTier}
                                        onChange={(e) => setFormData({ ...formData, licenseTier: e.target.value })}
                                    >
                                        <option value="starter">Starter (5 Promoters)</option>
                                        <option value="pro">Pro (10 Promoters)</option>
                                        <option value="enterprise">Enterprise (Unlimited)</option>
                                    </select>
                                </div>
                                <div className="dialog-field">
                                    <label>Promoter Capacity Limit</label>
                                    <input
                                        type="number"
                                        className="dialog-input"
                                        value={formData.promoterLimit}
                                        onChange={(e) => setFormData({ ...formData, promoterLimit: parseInt(e.target.value) || 5 })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Monthly AI Scans</label>
                                    <input
                                        type="number"
                                        className="dialog-input"
                                        value={formData.aiScanQuota}
                                        onChange={(e) => setFormData({ ...formData, aiScanQuota: parseInt(e.target.value) || 100 })}
                                    />
                                </div>
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-primary">
                                    Create Manager Account
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
                <div className="high-z-overlay" onClick={() => setShowQuotaModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiPencil style={{ color: '#0284c7', fontSize: '1.25rem' }} />
                                <h3>Adjust Quotas & License Tier</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowQuotaModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleSaveQuota} className="dialog-body">
                            <p className="dialog-desc">
                                Updating limits for <strong>{editingManager.name}</strong> ({editingManager.companyName || 'Agency'}):
                            </p>

                            <div className="dialog-field">
                                <label>License Tier</label>
                                <select
                                    className="dialog-select"
                                    value={editingManager.licenseTier || 'starter'}
                                    onChange={(e) => setEditingManager({ ...editingManager, licenseTier: e.target.value })}
                                >
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro Tier</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div className="dialog-field">
                                <label>Promoter Capacity Limit</label>
                                <input
                                    type="number"
                                    className="dialog-input"
                                    value={editingManager.promoterLimit || 5}
                                    onChange={(e) => setEditingManager({ ...editingManager, promoterLimit: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="dialog-field">
                                <label>Monthly AI Verification Scan Quota</label>
                                <input
                                    type="number"
                                    className="dialog-input"
                                    value={editingManager.aiScanQuota || 100}
                                    onChange={(e) => setEditingManager({ ...editingManager, aiScanQuota: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowQuotaModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 EMERGENCY DIRECT PASSWORD RESET MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showPasswordResetModal && resettingManager && (
                <div className="high-z-overlay" onClick={() => setShowPasswordResetModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiKey style={{ color: '#d97706', fontSize: '1.25rem' }} />
                                <h3>Direct Password Override</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowPasswordResetModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordReset} className="dialog-body">
                            <p className="dialog-desc">
                                Set a direct new password for <strong>{resettingManager.name}</strong> ({resettingManager.email}):
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
                                <button type="button" className="btn-cancel" onClick={() => setShowPasswordResetModal(false)}>
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
                        <form onSubmit={handleReassignPromoter} className="dialog-body">
                            <p className="dialog-desc">
                                Transfer <strong>{promoterToReassign.name}</strong> from <strong>{selectedDossier?.manager?.name || 'Current Manager'}</strong> to a new manager:
                            </p>

                            <div className="dialog-field">
                                <label>Destination Managing Agency *</label>
                                <select
                                    required
                                    className="dialog-select"
                                    value={targetManagerId}
                                    onChange={(e) => setTargetManagerId(e.target.value)}
                                >
                                    <option value="">Select Destination Agency...</option>
                                    {managers
                                        .filter((m) => m._id !== selectedDossier?.manager?._id)
                                        .map((m) => (
                                            <option key={m._id} value={m._id}>
                                                {m.name} — {m.companyName || 'Agency'} (Capacity: {m.promoterCount || 0}/{m.promoterLimit || 5})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowReassignModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-primary">
                                    Confirm Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 MANAGER DOSSIER DRAWER (FULL ENTERPRISE DEEP PROFILE)
               ════════════════════════════════════════════════════════════════ */}
            {showDossierDrawer && (
                <div className="dossier-drawer-overlay" onClick={() => setShowDossierDrawer(false)}>
                    <div className="dossier-drawer-content" onClick={(e) => e.stopPropagation()}>
                        <div className="dossier-header">
                            <div className="dossier-header-title">
                                <span className="dossier-tag">🏢 ENTERPRISE MANAGER PROFILE</span>
                                <h2>{selectedDossier?.manager?.name || 'Loading Dossier...'}</h2>
                                <p>{selectedDossier?.manager?.companyName || 'Registered Enterprise'} • {selectedDossier?.manager?.email}</p>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowDossierDrawer(false)}>
                                <HiX size={22} />
                            </button>
                        </div>

                        {dossierLoading ? (
                            <div className="dossier-loading-wrap">
                                <Spinner size={36} color="#0f766e" />
                                <p>Compiling company dossier & audit history...</p>
                            </div>
                        ) : selectedDossier ? (
                            <div className="dossier-body">
                                {/* Navigation Tabs */}
                                <div className="dossier-tabs-strip">
                                    <button
                                        className={`dossier-tab-btn ${activeDossierTab === 'overview' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('overview')}
                                    >
                                        Overview & Quotas
                                    </button>
                                    <button
                                        className={`dossier-tab-btn ${activeDossierTab === 'promoters' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('promoters')}
                                    >
                                        Promoters ({selectedDossier.promoters?.length || 0})
                                    </button>
                                    <button
                                        className={`dossier-tab-btn ${activeDossierTab === 'campaigns' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('campaigns')}
                                    >
                                        Clients & Campaigns ({selectedDossier.clients?.length || 0})
                                    </button>
                                    <button
                                        className={`dossier-tab-btn ${activeDossierTab === 'audit' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('audit')}
                                    >
                                        AI Audit Stream
                                    </button>
                                </div>

                                {/* Overview Tab */}
                                {activeDossierTab === 'overview' && (
                                    <div className="tab-pane">
                                        <div className="dossier-kpi-grid">
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Total Batches Submitted</span>
                                                <strong className="kpi-val">{selectedDossier.metrics?.totalBatches || 0}</strong>
                                                <span className="kpi-sub">{selectedDossier.metrics?.totalPhotos || 0} Photos</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Batch Pass Rate</span>
                                                <strong className="kpi-val" style={{ color: '#16a34a' }}>
                                                    {selectedDossier.metrics?.passRate || '100%'}
                                                </strong>
                                                <span className="kpi-sub">
                                                    {selectedDossier.metrics?.statusMap?.approved || 0} approved / {selectedDossier.metrics?.statusMap?.rejected || 0} rejected
                                                </span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">AI Duplicates Caught</span>
                                                <strong className="kpi-val" style={{ color: '#dc2626' }}>
                                                    {selectedDossier.metrics?.totalDuplicatesCaught || 0} Flagged
                                                </strong>
                                                <span className="kpi-sub">Perceptual Hash</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Faces GDPR Protected</span>
                                                <strong className="kpi-val" style={{ color: '#0d9488' }}>
                                                    {selectedDossier.metrics?.totalFacesProtected || 0}
                                                </strong>
                                                <span className="kpi-sub">Biometrics Redacted</span>
                                            </div>
                                        </div>

                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Company & Enterprise Profile</h4>
                                            <div className="dossier-spec-row">
                                                <span>Company Name:</span>
                                                <strong>{selectedDossier.manager.companyName || 'Not specified'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Work Email:</span>
                                                <strong>{selectedDossier.manager.email}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Phone Number:</span>
                                                <strong>{selectedDossier.manager.phone || 'Not provided'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Office Address:</span>
                                                <strong>{selectedDossier.manager.address || 'Not registered'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Tax ID / Business Registration:</span>
                                                <strong>{selectedDossier.manager.taxId || 'Not registered'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>License Tier:</span>
                                                <strong className={`tier-badge ${selectedDossier.licenseTier}`}>
                                                    {selectedDossier.licenseTier.toUpperCase()}
                                                </strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Promoter Capacity:</span>
                                                <strong>{selectedDossier.promotersCreated} / {selectedDossier.promoterLimit} promoters</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Monthly AI Scan Quota:</span>
                                                <strong>{selectedDossier.aiScanQuota.toLocaleString()} scans / mo</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Storage Allocation:</span>
                                                <strong>{selectedDossier.storageQuotaMB} MB</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Account Status:</span>
                                                <strong style={{ color: selectedDossier.manager.isActive !== false ? '#16a34a' : '#dc2626' }}>
                                                    {selectedDossier.manager.isActive !== false ? 'Active' : 'Suspended'}
                                                </strong>
                                            </div>
                                        </div>

                                        {selectedDossier.manager.adminNotes && (
                                            <div className="dossier-detail-card" style={{ marginTop: '14px' }}>
                                                <h4 className="card-sec-title">Administrator Notes</h4>
                                                <p className="admin-notes-text">{selectedDossier.manager.adminNotes}</p>
                                            </div>
                                        )}

                                        {/* Quick Actions inside Dossier */}
                                        <div className="dossier-actions-strip">
                                            <button
                                                className="btn-dossier-action btn-impersonate"
                                                onClick={() => handleImpersonate(selectedDossier.manager)}
                                            >
                                                <HiLogin /> Login as Manager
                                            </button>
                                            <button
                                                className="btn-dossier-action"
                                                onClick={() => { setEditingManager({ ...selectedDossier.manager }); setShowQuotaModal(true); }}
                                            >
                                                <HiPencil /> Edit Quotas
                                            </button>
                                            <button
                                                className="btn-dossier-action"
                                                onClick={() => { setResettingManager(selectedDossier.manager); setNewPassword(''); setShowPasswordResetModal(true); }}
                                            >
                                                <HiKey /> Reset Password
                                            </button>
                                            <button
                                                className={`btn-dossier-action ${selectedDossier.manager.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                                                onClick={() => handleToggle(selectedDossier.manager)}
                                            >
                                                {selectedDossier.manager.isActive !== false ? <HiBan /> : <HiCheck />}
                                                {selectedDossier.manager.isActive !== false ? 'Suspend Account' : 'Activate Account'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Promoters Tab */}
                                {activeDossierTab === 'promoters' && (
                                    <div className="tab-pane">
                                        <div className="promoters-dossier-list">
                                            {selectedDossier.promoters?.length === 0 ? (
                                                <p className="no-data-msg">No field promoters currently assigned to this manager.</p>
                                            ) : (
                                                selectedDossier.promoters.map((p) => (
                                                    <div key={p._id} className="promoter-dossier-row">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`status-dot ${p.isOnline ? 'online' : 'offline'}`} title={p.isOnline ? 'Online Now' : 'Offline'}></div>
                                                            <div>
                                                                <strong>{p.name}</strong>
                                                                <div className="sub-text">{p.email}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <span className="block text-xs font-semibold text-gray-500">{p.stats?.totalBatches || 0} Batches</span>
                                                                <span className="text-xs text-teal-600 font-bold">{p.stats?.approvalRatio || 100}% Pass</span>
                                                            </div>
                                                            <button
                                                                className="btn-reassign-small"
                                                                onClick={() => { setPromoterToReassign(p); setTargetManagerId(''); setShowReassignModal(true); }}
                                                                title="Transfer Promoter to Another Manager"
                                                            >
                                                                <HiSwitchHorizontal /> Reassign
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Campaigns & Clients Tab */}
                                {activeDossierTab === 'campaigns' && (
                                    <div className="tab-pane">
                                        <div className="campaigns-dossier-list">
                                            {selectedDossier.clients?.length === 0 ? (
                                                <p className="no-data-msg">No brand clients registered under this agency.</p>
                                            ) : (
                                                selectedDossier.clients.map((c) => (
                                                    <div key={c._id} className="campaign-dossier-row">
                                                        <div>
                                                            <strong>{c.name}</strong>
                                                            <div className="sub-text">{c.industry || 'Brand Client'} • Contact: {c.contactPerson || 'N/A'} ({c.contactEmail})</div>
                                                            {c.phone && <div className="sub-text">📞 {c.phone}</div>}
                                                        </div>
                                                        <div className="campaign-count-pill">
                                                            {c.campaigns?.length || 0} Campaigns
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* AI Audit Stream Tab */}
                                {activeDossierTab === 'audit' && (
                                    <div className="tab-pane">
                                        <div className="fraud-summary-banner">
                                            <div className="flex items-center gap-2">
                                                <HiShieldCheck size={20} style={{ color: '#0d9488' }} />
                                                <div>
                                                    <strong>AI Integrity & Fraud Catch Summary</strong>
                                                    <div className="text-xs text-gray-600">
                                                        {selectedDossier.metrics?.totalDuplicatesCaught || 0} duplicate fraud attempts blocked. Zero-Knowledge Geofence active.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="card-sec-title" style={{ marginTop: '16px' }}>Recent Agency Batches</h4>
                                        <div className="recent-batches-list">
                                            {selectedDossier.recentBatches?.length === 0 ? (
                                                <p className="no-data-msg">No batches uploaded yet by this agency.</p>
                                            ) : (
                                                selectedDossier.recentBatches.map((b) => (
                                                    <div key={b._id} className="recent-batch-row">
                                                        <div>
                                                            <strong>{b.title}</strong>
                                                            <div className="sub-text">
                                                                📍 {b.location || 'Location Not Specified'} • {b.photoCount || 0} Photos
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-teal-600">
                                                                {b.aiSummary?.verificationScore || 100}% Integrity
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
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <style>{`
                .admin-managers-page {
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

                .btn-primary-header {
                    background: #0d9488;
                    color: #ffffff;
                    border: none;
                    padding: 9px 16px;
                    border-radius: 8px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: background 0.15s ease;
                }

                .btn-primary-header:hover { background: #0f766e; }

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

                .manager-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .manager-avatar-badge {
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

                .manager-title-link {
                    font-weight: 600;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .manager-title-link:hover {
                    color: #0d9488;
                    text-decoration: underline;
                }

                .manager-sub-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }

                .company-pill {
                    color: #0284c7;
                    font-weight: 500;
                }

                .tier-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 700;
                }
                .tier-badge.starter { background: #f1f5f9; color: #475569; }
                .tier-badge.pro { background: #e0f2fe; color: #0284c7; }
                .tier-badge.enterprise { background: #fef3c7; color: #b45309; }

                .capacity-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    width: 120px;
                }

                .cap-nums {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.78rem;
                    font-weight: 600;
                }

                .cap-pct { color: var(--text-secondary); }

                .cap-track {
                    height: 6px;
                    background: var(--border-color);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .cap-fill {
                    height: 100%;
                    background: #0d9488;
                    border-radius: 4px;
                }

                .cap-fill.danger { background: #dc2626; }

                .quota-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }

                .quota-unit {
                    font-size: 0.75rem;
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
                .status-pill.draft { background: #f1f5f9; color: #475569; }

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
                    width: min(520px, 95vw);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                }

                .popup-dialog.lg { width: min(680px, 95vw); }

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

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .form-grid-3 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 12px;
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

                .dialog-input, .dialog-select, .dialog-textarea {
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

                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
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

                .admin-notes-text {
                    font-size: 0.88rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin: 0;
                    font-style: italic;
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
                    background: #0284c7;
                    color: #ffffff;
                    border-color: #0284c7;
                }

                .promoter-dossier-row, .campaign-dossier-row, .recent-batch-row {
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

                .btn-reassign-small {
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    color: #1d4ed8;
                    padding: 5px 10px;
                    border-radius: 6px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .campaign-count-pill {
                    background: #f1f5f9;
                    color: #475569;
                    font-size: 0.78rem;
                    font-weight: 700;
                    padding: 3px 8px;
                    border-radius: 6px;
                }

                .fraud-summary-banner {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    padding: 12px 14px;
                    border-radius: 8px;
                    color: #166534;
                }

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

export default AdminManagers;
