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
    HiClock,
    HiExternalLink,
    HiMail
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

    // Delete Confirmation Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [managerToDelete, setManagerToDelete] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

    // Permanently Delete Manager
    const handleDeleteManager = async () => {
        if (!managerToDelete) return;
        try {
            setDeleteSubmitting(true);
            await api.delete(`/users/${managerToDelete._id}`);
            toast.success(`Manager ${managerToDelete.companyName || managerToDelete.name} permanently deleted`);
            setShowDeleteModal(false);
            setManagerToDelete(null);
            if (showDossierDrawer && selectedDossier?.manager._id === managerToDelete._id) {
                setShowDossierDrawer(false);
            }
            fetchManagers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete manager');
        } finally {
            setDeleteSubmitting(false);
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

    // Filters
    const filteredManagers = managers.filter((m) => {
        const matchesSearch =
            m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.phone?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTier = tierFilter === 'all' || m.licenseTier === tierFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && m.isActive !== false) ||
            (statusFilter === 'inactive' && m.isActive === false);

        return matchesSearch && matchesTier && matchesStatus;
    });

    const activeCount = managers.filter(m => m.isActive !== false).length;
    const enterpriseCount = managers.filter(m => m.licenseTier === 'enterprise').length;

    return (
        <div className="admin-managers-page">
            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Enterprise Manager Hub</h1>
                    <p className="page-sub-text">
                        Corporate partner registry, live license quotas, promoter allocations, and administrator overrides.
                    </p>
                </div>
                <button className="btn-primary-blue" onClick={() => setShowCreateModal(true)}>
                    <HiPlus /> Add New Manager
                </button>
            </div>

            {/* Quick KPI Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiOfficeBuilding />
                        </div>
                        <div>
                            <span className="stat-val">{managers.length}</span>
                            <span className="stat-lbl">Total Agencies</span>
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
                            <span className="stat-lbl">Active Licenses</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                            <HiSparkles />
                        </div>
                        <div>
                            <span className="stat-val">{enterpriseCount}</span>
                            <span className="stat-lbl">Enterprise Tier</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                            <HiShieldCheck />
                        </div>
                        <div>
                            <span className="stat-val">100%</span>
                            <span className="stat-lbl">GDPR Guard Enforced</span>
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
                            placeholder="Search by company name, contact manager, email, or phone..."
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
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            className="clean-select"
                        >
                            <option value="all">All License Tiers</option>
                            <option value="starter">Starter Tier</option>
                            <option value="pro">Pro Tier</option>
                            <option value="enterprise">Enterprise Tier</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="clean-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Agencies</option>
                            <option value="inactive">Deactivated</option>
                        </select>

                        <button type="button" className="refresh-icon-btn" onClick={fetchManagers} title="Refresh Table">
                            <HiRefresh />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-wrapper-card">
                {loading ? (
                    <div className="loading-state">
                        <Spinner size={32} color="#2563eb" />
                    </div>
                ) : filteredManagers.length === 0 ? (
                    <div className="empty-feed">
                        <HiOfficeBuilding size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                        <h3>No manager accounts found</h3>
                        <p>Try adjusting your search query or license filter.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>COMPANY & CONTACT</th>
                                    <th>LICENSE TIER</th>
                                    <th>FIELD STAFF CAPACITY</th>
                                    <th>AI SCAN QUOTA</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>SUPER-ADMIN ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredManagers.map((m) => {
                                    const tier = m.licenseTier || 'pro';
                                    const capacityPercent = Math.min(100, Math.round(((m.promoterCount || 0) / (m.promoterLimit || 10)) * 100));

                                    return (
                                        <tr key={m._id}>
                                            <td>
                                                <div className="company-info-cell">
                                                    <div className="company-avatar-badge">
                                                        {(m.companyName || m.name || 'M').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong className="company-title-link" onClick={() => openDossier(m)}>
                                                            {m.companyName || m.name}
                                                        </strong>
                                                        <div className="contact-sub-meta">
                                                            <span>👤 {m.name}</span>
                                                            <span>• {m.email}</span>
                                                            {m.phone && <span>• 📞 {m.phone}</span>}
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
                                                <div className="quota-bar-cell">
                                                    <div className="flex justify-between text-xs">
                                                        <span><strong>{m.promoterCount || 0}</strong> / {m.promoterLimit || 10} Staff</span>
                                                        <span className="text-gray-400">{capacityPercent}%</span>
                                                    </div>
                                                    <div className="quota-progress-track">
                                                        <div 
                                                            className="quota-progress-fill" 
                                                            style={{ 
                                                                width: `${capacityPercent}%`,
                                                                background: capacityPercent > 90 ? '#ef4444' : capacityPercent > 70 ? '#f59e0b' : '#2563eb' 
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ai-quota-cell">
                                                    <span>⚡ {m.aiScanQuota ? m.aiScanQuota.toLocaleString() : '1,000'} Scans/mo</span>
                                                    <span className="storage-sub">📦 {Math.round((m.storageQuotaMB || 5120) / 1024)} GB Cloud</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${m.isActive !== false ? 'active' : 'suspended'}`}>
                                                    {m.isActive !== false ? 'Active' : 'Deactivated'}
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
                                                        title="Adjust Quotas & Tier"
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
                                                        title={m.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                                                    >
                                                        {m.isActive !== false ? <HiBan /> : <HiCheck />}
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-delete-danger"
                                                        onClick={() => { setManagerToDelete(m); setShowDeleteModal(true); }}
                                                        title="Permanently Delete Manager"
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
                 CREATE MANAGER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showCreateModal && (
                <div className="high-z-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="popup-dialog modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiOfficeBuilding style={{ color: '#2563eb', fontSize: '1.25rem' }} />
                                <h3>Create Enterprise Manager Account</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowCreateModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="dialog-body">
                            <div className="form-grid-2">
                                <div className="dialog-field">
                                    <label>Company Legal Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="dialog-input"
                                        placeholder="e.g. Apex Marketing Global"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Contact Manager Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="dialog-input"
                                        placeholder="e.g. Sarah Jenkins"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="dialog-field">
                                    <label>Business Email *</label>
                                    <input
                                        type="email"
                                        required
                                        className="dialog-input"
                                        placeholder="manager@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Initial Secure Password *</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        className="dialog-input"
                                        placeholder="Minimum 6 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="dialog-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        className="dialog-input"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Tax ID / Business Registration</label>
                                    <input
                                        type="text"
                                        className="dialog-input"
                                        placeholder="e.g. US-EIN-992140"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
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
                                        <option value="pro">Pro (15 Promoters)</option>
                                        <option value="enterprise">Enterprise (Unlimited)</option>
                                    </select>
                                </div>
                                <div className="dialog-field">
                                    <label>Promoter Capacity Limit</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="dialog-input"
                                        value={formData.promoterLimit}
                                        onChange={(e) => setFormData({ ...formData, promoterLimit: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Monthly AI Scans</label>
                                    <input
                                        type="number"
                                        min={100}
                                        step={500}
                                        className="dialog-input"
                                        value={formData.aiScanQuota}
                                        onChange={(e) => setFormData({ ...formData, aiScanQuota: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="dialog-field">
                                <label>Administrator Private Notes</label>
                                <textarea
                                    className="dialog-input"
                                    rows={2}
                                    placeholder="Internal notes regarding contract, SLA terms, or account manager..."
                                    value={formData.adminNotes}
                                    onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                                />
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-blue">
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
                                <HiPencil style={{ color: '#2563eb', fontSize: '1.25rem' }} />
                                <h3>Edit Quotas & Tier: {editingManager.companyName || editingManager.name}</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowQuotaModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleSaveQuota} className="dialog-body">
                            <div className="dialog-field">
                                <label>License Tier</label>
                                <select
                                    className="dialog-select"
                                    value={editingManager.licenseTier || 'pro'}
                                    onChange={(e) => setEditingManager({ ...editingManager, licenseTier: e.target.value })}
                                >
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div className="form-grid-2">
                                <div className="dialog-field">
                                    <label>Promoter Capacity Limit</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="dialog-input"
                                        value={editingManager.promoterLimit || 10}
                                        onChange={(e) => setEditingManager({ ...editingManager, promoterLimit: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="dialog-field">
                                    <label>Monthly AI Scan Quota</label>
                                    <input
                                        type="number"
                                        min={100}
                                        step={500}
                                        className="dialog-input"
                                        value={editingManager.aiScanQuota || 1000}
                                        onChange={(e) => setEditingManager({ ...editingManager, aiScanQuota: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="dialog-field">
                                <label>Cloud Storage Allocation (MB)</label>
                                <input
                                    type="number"
                                    min={512}
                                    step={1024}
                                    className="dialog-input"
                                    value={editingManager.storageQuotaMB || 5120}
                                    onChange={(e) => setEditingManager({ ...editingManager, storageQuotaMB: Number(e.target.value) })}
                                />
                            </div>

                            <div className="dialog-field">
                                <label>Admin Private Notes</label>
                                <textarea
                                    className="dialog-input"
                                    rows={2}
                                    value={editingManager.adminNotes || ''}
                                    onChange={(e) => setEditingManager({ ...editingManager, adminNotes: e.target.value })}
                                />
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowQuotaModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-blue">
                                    Save License Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 PASSWORD RESET MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showPasswordResetModal && resettingManager && (
                <div className="high-z-overlay" onClick={() => setShowPasswordResetModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiKey style={{ color: '#d97706', fontSize: '1.25rem' }} />
                                <h3>Direct Password Reset (Emergency Override)</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowPasswordResetModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordReset} className="dialog-body">
                            <p className="dialog-desc">
                                Override password for <strong>{resettingManager.name}</strong> ({resettingManager.email}) without requiring email confirmation or OTP bypass:
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
                                <button type="submit" className="btn-confirm-blue">
                                    Override Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 DELETE CONFIRMATION MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showDeleteModal && managerToDelete && (
                <div className="high-z-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header" style={{ borderBottomColor: '#fee2e2', background: '#fff5f5' }}>
                            <div className="flex items-center gap-2">
                                <HiTrash style={{ color: '#dc2626', fontSize: '1.25rem' }} />
                                <h3 style={{ color: '#991b1b' }}>Delete Manager Account</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowDeleteModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <div className="dialog-body">
                            <p className="dialog-desc" style={{ color: '#7f1d1d' }}>
                                Are you sure you want to permanently delete <strong>{managerToDelete.companyName || managerToDelete.name}</strong> ({managerToDelete.email})?
                            </p>
                            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#991b1b' }}>
                                ⚠️ <strong>Warning:</strong> This will revoke all platform access for this manager. Associated promoters will need to be reassigned.
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn-danger-confirm" 
                                    onClick={handleDeleteManager}
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
                 REASSIGN PROMOTER MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showReassignModal && promoterToReassign && (
                <div className="high-z-overlay" onClick={() => setShowReassignModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiSwitchHorizontal style={{ color: '#2563eb', fontSize: '1.25rem' }} />
                                <h3>Reassign Field Promoter</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowReassignModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleReassignPromoter} className="dialog-body">
                            <p className="dialog-desc">
                                Transfer <strong>{promoterToReassign.name}</strong> to another managing agency:
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
                                        .filter(m => m._id !== selectedDossier?.manager._id)
                                        .map(m => (
                                            <option key={m._id} value={m._id}>
                                                {m.companyName || m.name} ({m.name}) — Capacity: {m.promoterCount || 0}/{m.promoterLimit || 10}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowReassignModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-blue">
                                    Transfer Promoter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 MANAGER DOSSIER DRAWER (HIGHLY DETAILED & RICH)
               ════════════════════════════════════════════════════════════════ */}
            {showDossierDrawer && (
                <div className="dossier-drawer-overlay" onClick={() => setShowDossierDrawer(false)}>
                    <div className="dossier-drawer-content" onClick={(e) => e.stopPropagation()}>
                        <div className="dossier-header">
                            <div className="dossier-header-title">
                                <span className="dossier-tag">🏢 ENTERPRISE MANAGER DOSSIER</span>
                                <h2>{selectedDossier?.manager?.companyName || selectedDossier?.manager?.name || 'Loading Dossier...'}</h2>
                                <p>Contact: {selectedDossier?.manager?.name} • {selectedDossier?.manager?.email}</p>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowDossierDrawer(false)}>
                                <HiX size={22} />
                            </button>
                        </div>

                        {dossierLoading ? (
                            <div className="dossier-loading-wrap">
                                <Spinner size={36} color="#2563eb" />
                                <p>Aggregating live agency telemetry, quotas & campaigns...</p>
                            </div>
                        ) : selectedDossier ? (
                            <div className="dossier-body">
                                {/* Navigation Tabs Strip */}
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
                                        className={`dossier-tab-btn ${activeDossierTab === 'clients' ? 'active' : ''}`}
                                        onClick={() => setActiveDossierTab('clients')}
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

                                {/* Overview & Quotas Tab */}
                                {activeDossierTab === 'overview' && (
                                    <div className="tab-pane">
                                        {/* 4 KPIs */}
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
                                                <span className="kpi-sub">Quality verified index</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">AI Fraud / Duplicates Caught</span>
                                                <strong className="kpi-val" style={{ color: selectedDossier.stats?.totalDuplicates > 0 ? '#ef4444' : '#16a34a' }}>
                                                    {selectedDossier.stats?.totalDuplicates || 0} Flagged
                                                </strong>
                                                <span className="kpi-sub">Perceptual Hash AI</span>
                                            </div>
                                            <div className="kpi-card">
                                                <span className="kpi-lbl">Faces GDPR-Protected</span>
                                                <strong className="kpi-val" style={{ color: '#2563eb' }}>
                                                    {selectedDossier.stats?.totalFaces || 0} Faces
                                                </strong>
                                                <span className="kpi-sub">100% Anonymized</span>
                                            </div>
                                        </div>

                                        {/* License Quota Gauges */}
                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Live Quotas & Resource Allocation</h4>
                                            
                                            <div className="quota-row-item">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>👥 Field Promoter Staff Capacity:</span>
                                                    <strong>{selectedDossier.promoters?.length || 0} / {selectedDossier.manager?.promoterLimit || 10} Slots Used</strong>
                                                </div>
                                                <div className="quota-progress-track">
                                                    <div 
                                                        className="quota-progress-fill" 
                                                        style={{ 
                                                            width: `${Math.min(100, Math.round(((selectedDossier.promoters?.length || 0) / (selectedDossier.manager?.promoterLimit || 10)) * 100))}%`,
                                                            background: '#2563eb' 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="quota-row-item" style={{ marginTop: '12px' }}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>⚡ Monthly AI Scan Quota:</span>
                                                    <strong>{selectedDossier.stats?.totalPhotos || 0} / {selectedDossier.manager?.aiScanQuota || 1000} Scans Used</strong>
                                                </div>
                                                <div className="quota-progress-track">
                                                    <div 
                                                        className="quota-progress-fill" 
                                                        style={{ 
                                                            width: `${Math.min(100, Math.round(((selectedDossier.stats?.totalPhotos || 0) / (selectedDossier.manager?.aiScanQuota || 1000)) * 100))}%`,
                                                            background: '#4f46e5' 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="quota-row-item" style={{ marginTop: '12px' }}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span>📦 Cloud Storage Allocation:</span>
                                                    <strong>{Math.round(((selectedDossier.stats?.totalPhotos || 0) * 0.45) + 50)} MB / {selectedDossier.manager?.storageQuotaMB || 5120} MB Used</strong>
                                                </div>
                                                <div className="quota-progress-track">
                                                    <div 
                                                        className="quota-progress-fill" 
                                                        style={{ width: '12%', background: '#0284c7' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company Credentials */}
                                        <div className="dossier-detail-card">
                                            <h4 className="card-sec-title">Corporate Credentials & Registration</h4>
                                            <div className="dossier-spec-row">
                                                <span>Active License Tier:</span>
                                                <strong className={`tier-badge ${selectedDossier.manager?.licenseTier || 'pro'}`}>
                                                    {(selectedDossier.manager?.licenseTier || 'pro').toUpperCase()}
                                                </strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Tax ID / Registration:</span>
                                                <strong>{selectedDossier.manager?.taxId || 'Verified Partner'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Office / HQ Address:</span>
                                                <strong>{selectedDossier.manager?.address || 'Corporate Headquarters on File'}</strong>
                                            </div>
                                            <div className="dossier-spec-row">
                                                <span>Account Registered:</span>
                                                <strong>{new Date(selectedDossier.manager?.createdAt).toLocaleDateString()}</strong>
                                            </div>
                                            {selectedDossier.manager?.adminNotes && (
                                                <div className="dossier-spec-row">
                                                    <span>Admin Notes:</span>
                                                    <strong style={{ color: '#4f46e5' }}>{selectedDossier.manager.adminNotes}</strong>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Managed Promoters Tab */}
                                {activeDossierTab === 'promoters' && (
                                    <div className="tab-pane">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="card-sec-title" style={{ margin: 0 }}>
                                                Assigned Field Promoters ({selectedDossier.promoters?.length || 0})
                                            </h4>
                                        </div>

                                        <div className="promoters-dossier-list">
                                            {selectedDossier.promoters?.length === 0 ? (
                                                <p className="no-data-msg">No promoters assigned to this agency yet.</p>
                                            ) : (
                                                selectedDossier.promoters.map((p) => (
                                                    <div key={p._id} className="promoter-dossier-item">
                                                        <div className="flex items-center gap-3">
                                                            <div className="promoter-mini-badge">
                                                                {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <strong>{p.name}</strong>
                                                                    <div className={`status-dot ${p.isOnline ? 'online' : 'offline'}`} title={p.isOnline ? 'Online Now' : 'Offline'}></div>
                                                                </div>
                                                                <span className="sub-text">{p.email}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-semibold text-gray-500">
                                                                {p.batchCount || 0} Batches
                                                            </span>
                                                            <button 
                                                                className="btn-action btn-secondary-act"
                                                                onClick={() => { setPromoterToReassign(p); setTargetManagerId(''); setShowReassignModal(true); }}
                                                                title="Transfer Promoter to Another Agency"
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

                                {/* Clients & Campaigns Tab */}
                                {activeDossierTab === 'clients' && (
                                    <div className="tab-pane">
                                        <h4 className="card-sec-title">Corporate Clients & Campaigns</h4>
                                        <div className="clients-dossier-list">
                                            {selectedDossier.clients?.length === 0 ? (
                                                <p className="no-data-msg">No clients registered under this agency yet.</p>
                                            ) : (
                                                selectedDossier.clients.map((c) => (
                                                    <div key={c._id} className="client-dossier-item">
                                                        <div>
                                                            <strong>{c.name}</strong>
                                                            <div className="sub-text">
                                                                👤 {c.contactPerson || 'Contact'} • {c.contactEmail || 'No Email'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="badge-blue">
                                                                {c.industry || 'Corporate Client'}
                                                            </span>
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
                                        <div className="ai-audit-banner">
                                            <HiShieldCheck size={28} style={{ color: '#2563eb' }} />
                                            <div>
                                                <strong>AI Integrity & Fraud Prevention</strong>
                                                <p>All batches undergo automated biometric face blur, perceptual duplicate analysis, and ZK geofencing.</p>
                                            </div>
                                        </div>

                                        <h4 className="card-sec-title mt-4">Recent Submissions Stream</h4>
                                        <div className="recent-batches-list">
                                            {selectedDossier.recentBatches?.length === 0 ? (
                                                <p className="no-data-msg">No submissions on record yet.</p>
                                            ) : (
                                                selectedDossier.recentBatches.map(b => (
                                                    <div key={b._id} className="recent-batch-row">
                                                        <div>
                                                            <strong>{b.title}</strong>
                                                            <div className="sub-text">
                                                                📍 {b.location || 'Field Zone'} • {b.photoCount || 0} Photos • by {b.promoter?.name || 'Promoter'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-blue-600">
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

                                {/* Dossier Super-Admin Action Strip */}
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
                                        {selectedDossier.manager.isActive !== false ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button 
                                        className="btn-dossier-action btn-delete-danger"
                                        onClick={() => { setManagerToDelete(selectedDossier.manager); setShowDeleteModal(true); }}
                                    >
                                        <HiTrash /> Delete Manager
                                    </button>
                                </div>
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

                .company-info-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .company-avatar-badge {
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

                .company-title-link {
                    font-weight: 600;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .company-title-link:hover {
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

                .tier-badge {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 700;
                }
                .tier-badge.starter { background: #f1f5f9; color: #475569; }
                .tier-badge.pro { background: #eff6ff; color: #2563eb; }
                .tier-badge.enterprise { background: #eef2ff; color: #4f46e5; }

                .quota-bar-cell {
                    min-width: 150px;
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

                .ai-quota-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.82rem;
                }

                .storage-sub {
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

                .btn-inspect { background: #2563eb; color: #ffffff; border-color: #2563eb; }
                .btn-inspect:hover { background: #1d4ed8; }

                .btn-impersonate { background: #4f46e5; color: #ffffff; border-color: #4f46e5; }
                .btn-impersonate:hover { background: #4338ca; }

                .btn-delete-danger { color: #dc2626; border-color: #fca5a5; }
                .btn-delete-danger:hover { background: #fee2e2; }

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

                .popup-dialog.modal-large {
                    width: min(640px, 95vw);
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

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .form-grid-3 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 10px;
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

                .promoter-dossier-item, .client-dossier-item, .recent-batch-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 14px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .promoter-mini-badge {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #2563eb;
                    color: #ffffff;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.85rem;
                }

                .badge-blue {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    background: #eff6ff;
                    color: #2563eb;
                }

                .ai-audit-banner {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    padding: 12px 16px;
                    border-radius: 8px;
                }

                .ai-audit-banner p {
                    margin: 2px 0 0 0;
                    font-size: 0.82rem;
                    color: #1e40af;
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

export default AdminManagers;
