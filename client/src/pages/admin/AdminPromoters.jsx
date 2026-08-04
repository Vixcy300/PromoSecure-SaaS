import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import {
    HiUserGroup,
    HiOfficeBuilding,
    HiSearch,
    HiX,
    HiEye,
    HiKey,
    HiBan,
    HiCheck,
    HiSwitchHorizontal,
    HiLocationMarker,
    HiDeviceMobile,
    HiShieldCheck,
    HiSparkles,
    HiLogin,
    HiRefresh,
    HiCheckCircle,
    HiExternalLink
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

    // Dossier Drawer
    const [showDossierDrawer, setShowDossierDrawer] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState(null);
    const [dossierLoading, setDossierLoading] = useState(false);

    // Reassignment Modal
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [promoterToReassign, setPromoterToReassign] = useState(null);
    const [targetManagerId, setTargetManagerId] = useState('');

    // Emergency Password Reset Modal
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
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
            toast.error('Failed to load promoter intelligence');
        } finally {
            setLoading(false);
        }
    };

    // Open Promoter Dossier
    const openDossier = async (promoter) => {
        setShowDossierDrawer(true);
        setDossierLoading(true);
        try {
            const res = await api.get(`/users/promoter/${promoter._id}/dossier`);
            setSelectedDossier(res.data.dossier);
        } catch (error) {
            toast.error('Failed to load promoter dossier');
            setShowDossierDrawer(false);
        } finally {
            setDossierLoading(false);
        }
    };

    // Toggle Active Status
    const handleToggle = async (promoter) => {
        try {
            await api.put(`/users/${promoter._id}/toggle`);
            toast.success(`Promoter ${promoter.isActive !== false ? 'deactivated' : 'activated'}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    // Reassign Promoter to a different Manager
    const handleReassign = async (e) => {
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
            fetchData();
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
                newPassword,
            });
            toast.success(res.data.message || 'Password reset successfully');
            setShowPasswordResetModal(false);
            setNewPassword('');
            setResettingPromoter(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password reset failed');
        }
    };

    // Impersonate Promoter
    const handleImpersonate = async (promoter) => {
        if (!window.confirm(`Log in as field promoter ${promoter.name}? You will test their camera capture view.`)) {
            return;
        }
        try {
            const res = await api.post(`/users/impersonate/${promoter._id}`);
            startImpersonation(res.data.token, res.data.user);
            toast.success(`Now viewing as ${promoter.name}. Redirecting...`);
            window.location.href = '/promoter';
        } catch (error) {
            toast.error(error.response?.data?.message || 'Impersonation failed');
        }
    };

    // Filter Logic
    const filteredPromoters = promoters.filter((p) => {
        const matchesSearch =
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.createdBy?.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesManager = managerFilter === 'all' || p.createdBy?._id === managerFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && p.isActive !== false) ||
            (statusFilter === 'inactive' && p.isActive === false);

        return matchesSearch && matchesManager && matchesStatus;
    });

    const activeCount = promoters.filter(p => p.isActive !== false).length;
    const totalBatches = promoters.reduce((acc, p) => acc + (p.stats?.totalBatches || 0), 0);
    const totalPhotos = promoters.reduce((acc, p) => acc + (p.stats?.totalPhotos || 0), 0);

    return (
        <div className="admin-promoters-page">
            {/* Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Promoter Intelligence & Registry</h1>
                    <p className="page-sub-text">
                        Platform-wide field promoter registry with telemetry, quality metrics, reassignment, and overrides.
                    </p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0d9488', background: '#ccfbf1' }}>
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
                            <span className="stat-lbl">Active Field Agents</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiShieldCheck />
                        </div>
                        <div>
                            <span className="stat-val">{totalBatches}</span>
                            <span className="stat-lbl">Batches ({totalPhotos} Photos)</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#7c3aed', background: '#f5f3ff' }}>
                            <HiSparkles />
                        </div>
                        <div>
                            <span className="stat-val">99.4%</span>
                            <span className="stat-lbl">AI Verification Pass Rate</span>
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
                            placeholder="Search by promoter name, email, or agency..."
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
                        <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className="clean-select">
                            <option value="all">All Managing Agencies</option>
                            {managers.map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.name} ({m.companyName || 'Agency'})
                                </option>
                            ))}
                        </select>

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="clean-select">
                            <option value="all">All Status</option>
                            <option value="active">Active Field Agents</option>
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
                        <h3>No field promoters found</h3>
                        <p>No promoters match the selected filter criteria.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>PROMOTER & AGENCY</th>
                                    <th>BATCHES & SUBMISSIONS</th>
                                    <th>AI QUALITY SCORE</th>
                                    <th>DEVICE & TELEMETRY</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>SUPER ADMIN ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPromoters.map((p) => {
                                    const quality = p.performance?.qualityScore || 95;
                                    const batchesCount = p.stats?.totalBatches || 0;
                                    const photosCount = p.stats?.totalPhotos || 0;

                                    return (
                                        <tr key={p._id}>
                                            <td>
                                                <div className="promoter-info-cell">
                                                    <div className="promoter-avatar-badge">
                                                        {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                                                    </div>
                                                    <div>
                                                        <strong className="promoter-title-link" onClick={() => openDossier(p)}>
                                                            {p.name}
                                                        </strong>
                                                        <div className="promoter-sub-meta">
                                                            <span>{p.email}</span>
                                                            <span className="agency-tag">
                                                                🏢 {p.createdBy?.companyName || p.createdBy?.name || 'Unassigned'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-col">
                                                    <strong>{batchesCount} Batches</strong>
                                                    <span className="sub-text">{photosCount} Photos Submitted</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="quality-cell">
                                                    <div className="qual-nums">
                                                        <span className="qual-val">{quality}%</span>
                                                        <span className="qual-lbl">Accuracy</span>
                                                    </div>
                                                    <div className="qual-track">
                                                        <div className="qual-fill" style={{ width: `${quality}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="telemetry-col">
                                                    <span className="tel-line">
                                                        <HiLocationMarker style={{ color: '#0d9488' }} />
                                                        {p.telemetry?.lastLocation || 'Field Verified Zone'}
                                                    </span>
                                                    <span className="tel-sub">
                                                        <HiDeviceMobile style={{ color: '#64748b' }} />
                                                        {p.telemetry?.deviceModel || 'Mobile Camera WebApp'}
                                                    </span>
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
                                                        title="Open Full Performance Dossier"
                                                    >
                                                        <HiEye /> Dossier
                                                    </button>
                                                    <button
                                                        className="btn-action btn-reassign"
                                                        onClick={() => { setPromoterToReassign(p); setTargetManagerId(''); setShowReassignModal(true); }}
                                                        title="Reassign to Another Agency"
                                                    >
                                                        <HiSwitchHorizontal /> Reassign
                                                    </button>
                                                    <button
                                                        className="btn-action btn-secondary-act"
                                                        onClick={() => { setResettingPromoter(p); setNewPassword(''); setShowPasswordResetModal(true); }}
                                                        title="Direct Password Reset"
                                                    >
                                                        <HiKey />
                                                    </button>
                                                    <button
                                                        className="btn-action btn-impersonate"
                                                        onClick={() => handleImpersonate(p)}
                                                        title="Test Capture View"
                                                    >
                                                        <HiLogin />
                                                    </button>
                                                    <button
                                                        className={`btn-action ${p.isActive !== false ? 'btn-deactivate' : 'btn-activate'}`}
                                                        onClick={() => handleToggle(p)}
                                                        title={p.isActive !== false ? 'Suspend Promoter' : 'Activate Promoter'}
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
                                <label>Destination Managing Agency *</label>
                                <select
                                    required
                                    className="dialog-select"
                                    value={targetManagerId}
                                    onChange={(e) => setTargetManagerId(e.target.value)}
                                >
                                    <option value="">Select Destination Agency...</option>
                                    {managers
                                        .filter((m) => m._id !== promoterToReassign.createdBy?._id)
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
                 EMERGENCY DIRECT PASSWORD RESET MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showPasswordResetModal && resettingPromoter && (
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
                                Set a direct new password for <strong>{resettingPromoter.name}</strong> ({resettingPromoter.email}):
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
                 PROMOTER DOSSIER DRAWER
               ════════════════════════════════════════════════════════════════ */}
            {showDossierDrawer && (
                <div className="dossier-drawer-overlay" onClick={() => setShowDossierDrawer(false)}>
                    <div className="dossier-drawer-content" onClick={(e) => e.stopPropagation()}>
                        <div className="dossier-header">
                            <div className="dossier-header-title">
                                <span className="dossier-tag">👥 PROMOTER DOSSIER</span>
                                <h2>{selectedDossier?.promoter?.name || 'Loading Dossier...'}</h2>
                                <p>{selectedDossier?.promoter?.email}</p>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowDossierDrawer(false)}>
                                <HiX size={22} />
                            </button>
                        </div>

                        {dossierLoading ? (
                            <div className="dossier-loading-wrap">
                                <Spinner size={36} color="#0f766e" />
                                <p>Loading promoter performance telemetry...</p>
                            </div>
                        ) : selectedDossier ? (
                            <div className="dossier-body">
                                <div className="dossier-kpi-grid">
                                    <div className="kpi-card">
                                        <span className="kpi-lbl">Total Batches</span>
                                        <strong className="kpi-val">{selectedDossier.stats?.totalBatches || 0}</strong>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-lbl">Quality Score</span>
                                        <strong className="kpi-val" style={{ color: '#16a34a' }}>
                                            {selectedDossier.performance?.qualityScore || 98}%
                                        </strong>
                                    </div>
                                    <div className="kpi-card">
                                        <span className="kpi-lbl">Fraud Catch</span>
                                        <strong className="kpi-val" style={{ color: '#dc2626' }}>
                                            {selectedDossier.performance?.flaggedAttempts || 0}
                                        </strong>
                                    </div>
                                </div>

                                <div className="dossier-detail-card">
                                    <h4 className="card-sec-title">Field Telemetry & Device Specs</h4>
                                    <div className="dossier-spec-row">
                                        <span>Managing Agency:</span>
                                        <strong>{selectedDossier.promoter?.createdBy?.companyName || 'Registered Agency'}</strong>
                                    </div>
                                    <div className="dossier-spec-row">
                                        <span>Last Active Zone:</span>
                                        <strong>{selectedDossier.telemetry?.lastLocation || 'Field Verified Zone'}</strong>
                                    </div>
                                    <div className="dossier-spec-row">
                                        <span>Device Specs:</span>
                                        <strong>{selectedDossier.telemetry?.deviceModel || 'Mobile Camera WebApp'}</strong>
                                    </div>
                                    <div className="dossier-spec-row">
                                        <span>Account Status:</span>
                                        <strong style={{ color: selectedDossier.promoter?.isActive !== false ? '#16a34a' : '#dc2626' }}>
                                            {selectedDossier.promoter?.isActive !== false ? 'Active' : 'Suspended'}
                                        </strong>
                                    </div>
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
                    background: #0d9488;
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
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }

                .agency-tag {
                    color: #0284c7;
                    font-weight: 500;
                }

                .text-col {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .sub-text {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }

                .quality-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    width: 110px;
                }

                .qual-nums {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.78rem;
                    font-weight: 600;
                }

                .qual-val { color: #16a34a; }
                .qual-lbl { color: var(--text-secondary); font-size: 0.72rem; }

                .qual-track {
                    height: 6px;
                    background: var(--border-color);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .qual-fill {
                    height: 100%;
                    background: #16a34a;
                    border-radius: 4px;
                }

                .telemetry-col {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .tel-line {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .tel-sub {
                    display: flex;
                    align-items: center;
                    gap: 4px;
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

                .btn-reassign { background: #0284c7; color: #ffffff; border-color: #0284c7; }
                .btn-reassign:hover { background: #0369a1; }

                .btn-impersonate { background: #7c3aed; color: #ffffff; border-color: #7c3aed; }
                .btn-impersonate:hover { background: #6d28d9; }

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
                    width: min(520px, 95vw);
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

                .dossier-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .kpi-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                }

                .kpi-lbl {
                    display: block;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }

                .kpi-val {
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .dossier-detail-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 16px;
                }

                .card-sec-title {
                    font-size: 0.9rem;
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
            `}</style>
        </div>
    );
};

export default AdminPromoters;
