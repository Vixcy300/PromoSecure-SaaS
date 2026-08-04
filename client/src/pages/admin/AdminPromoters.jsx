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
    HiBadgeCheck,
    HiExclamation,
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
    const [qualityFilter, setQualityFilter] = useState('all');

    // Dossier Slide-Over
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
            toast.error('Failed to load promoter intelligence data');
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

    // Impersonate Promoter (Field test capture workflow)
    const handleImpersonate = async (promoter) => {
        if (!window.confirm(`Log in as field promoter ${promoter.name}? You will switch to their camera capture view.`)) {
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

    // Filters
    const filteredPromoters = promoters.filter((p) => {
        const matchesSearch =
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.createdBy?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.stats?.lastLocation?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesManager = managerFilter === 'all' || p.createdBy?._id === managerFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && p.isActive !== false) ||
            (statusFilter === 'suspended' && p.isActive === false);

        const quality = p.stats?.qualityScore || 95;
        const matchesQuality =
            qualityFilter === 'all' ||
            (qualityFilter === 'high' && quality >= 90) ||
            (qualityFilter === 'medium' && quality >= 75 && quality < 90) ||
            (qualityFilter === 'low' && quality < 75);

        return matchesSearch && matchesManager && matchesStatus && matchesQuality;
    });

    const onlineCount = promoters.filter(p => p.isOnline).length;
    const totalPhotosCount = promoters.reduce((sum, p) => sum + (p.stats?.totalPhotos || 0), 0);
    const totalDuplicatesCaught = promoters.reduce((sum, p) => sum + (p.stats?.totalDuplicates || 0), 0);

    return (
        <div className="promoter-intelligence-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Promoter Intelligence & Registry</h1>
                    <p className="page-subtitle">
                        Real-time field performance, GPS & device telemetry, quality audit scores, and super-admin reassignment controls.
                    </p>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="metrics-strip">
                <div className="metric-chip">
                    <HiUserGroup className="metric-icon" style={{ color: '#0d9488' }} />
                    <div>
                        <span className="metric-num">{promoters.length}</span>
                        <span className="metric-lbl">Total Field Promoters</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <div className="pulse-indicator-dot" />
                    <div>
                        <span className="metric-num">{onlineCount}</span>
                        <span className="metric-lbl">Active Now (Online)</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiBadgeCheck className="metric-icon" style={{ color: '#0284c7' }} />
                    <div>
                        <span className="metric-num">{totalPhotosCount}</span>
                        <span className="metric-lbl">Verified Field Photos</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiShieldCheck className="metric-icon" style={{ color: '#f59e0b' }} />
                    <div>
                        <span className="metric-num">{totalDuplicatesCaught}</span>
                        <span className="metric-lbl">AI Fraud Attempts Caught</span>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="controls-card">
                <div className="search-filter-row">
                    <div className="search-box">
                        <HiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by promoter name, email, manager, agency, location..."
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
                        <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
                            <option value="all">All Managers & Agencies</option>
                            {managers.map(m => (
                                <option key={m._id} value={m._id}>
                                    {m.name} ({m.companyName || 'Agency'})
                                </option>
                            ))}
                        </select>

                        <select value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)}>
                            <option value="all">All Quality Scores</option>
                            <option value="high">High Quality (&gt;90%)</option>
                            <option value="medium">Standard (75-89%)</option>
                            <option value="low">Flagged (&lt;75%)</option>
                        </select>

                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>

                        <button className="btn btn-ghost refresh-btn" onClick={fetchData} title="Refresh Registry">
                            <HiRefresh size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Promoters Table */}
            <div className="table-card">
                {loading ? (
                    <div className="table-loader">
                        <Spinner size={36} color="#0d9488" />
                    </div>
                ) : filteredPromoters.length === 0 ? (
                    <div className="empty-state">
                        <HiUserGroup size={48} style={{ color: '#94a3b8' }} />
                        <h3>No promoters found</h3>
                        <p>Try clearing filters or search query.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="promoters-table">
                            <thead>
                                <tr>
                                    <th>Promoter Profile</th>
                                    <th>Assigned Agency & Manager</th>
                                    <th>Performance Scorecard</th>
                                    <th>AI Quality & Fraud</th>
                                    <th>Last Telemetry & GPS</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Admin Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPromoters.map((p) => {
                                    const quality = p.stats?.qualityScore || 95;
                                    const qualityBadgeColor = quality >= 90 ? '#10b981' : quality >= 75 ? '#0284c7' : '#ef4444';

                                    return (
                                        <tr key={p._id}>
                                            <td>
                                                <div className="promoter-cell">
                                                    <div className="avatar-wrapper">
                                                        <div className="avatar-box">
                                                            {p.name?.[0]?.toUpperCase() || 'P'}
                                                        </div>
                                                        <span className={`live-dot ${p.isOnline ? 'online' : 'offline'}`} title={p.isOnline ? 'Active within last 15m' : 'Offline'} />
                                                    </div>
                                                    <div>
                                                        <strong 
                                                            className="promoter-link"
                                                            onClick={() => openDossier(p)}
                                                            title="View Deep Telemetry Dossier"
                                                        >
                                                            {p.name}
                                                        </strong>
                                                        <div className="promoter-email">{p.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="manager-info-cell">
                                                    <strong>{p.createdBy?.name || 'Unassigned'}</strong>
                                                    <span className="agency-tag">
                                                        🏢 {p.createdBy?.companyName || 'Independent'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="scorecard-cell">
                                                    <div className="scorecard-row">
                                                        <span>Batches:</span>
                                                        <strong>{p.stats?.totalBatches || 0} ({p.stats?.approvedBatches || 0} ✓)</strong>
                                                    </div>
                                                    <div className="scorecard-row">
                                                        <span>Photos:</span>
                                                        <strong>📸 {p.stats?.totalPhotos || 0}</strong>
                                                    </div>
                                                    <div className="scorecard-row">
                                                        <span>Approval:</span>
                                                        <span style={{ color: (p.stats?.approvalRatio || 100) >= 80 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                                                            {p.stats?.approvalRatio || 100}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="quality-cell">
                                                    <div className="quality-pill" style={{ color: qualityBadgeColor, borderColor: qualityBadgeColor }}>
                                                        <HiSparkles size={14} />
                                                        <strong>{quality}%</strong> Quality
                                                    </div>
                                                    {(p.stats?.totalDuplicates || 0) > 0 && (
                                                        <span className="fraud-warn-tag">
                                                            ⚠️ {p.stats.totalDuplicates} duplicate(s) caught
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="telemetry-cell">
                                                    {p.stats?.lastLocation ? (
                                                        <span className="location-pin">
                                                            <HiLocationMarker size={14} style={{ color: '#0d9488' }} />
                                                            {p.stats.lastLocation}
                                                        </span>
                                                    ) : (
                                                        <span className="no-loc">No GPS history</span>
                                                    )}
                                                    {p.stats?.lastGps?.lat && (
                                                        <a
                                                            href={`https://maps.google.com/?q=${p.stats.lastGps.lat},${p.stats.lastGps.lng}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="maps-link"
                                                        >
                                                            View Map <HiExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${p.isActive !== false ? 'active' : 'suspended'}`}>
                                                    {p.isActive !== false ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons-cell">
                                                    <button
                                                        className="action-btn dossier"
                                                        onClick={() => openDossier(p)}
                                                        title="Open Deep Dossier"
                                                    >
                                                        <HiEye size={15} /> Dossier
                                                    </button>
                                                    <button
                                                        className="action-btn reassign"
                                                        onClick={() => {
                                                            setPromoterToReassign(p);
                                                            setShowReassignModal(true);
                                                        }}
                                                        title="Reassign to another Agency / Manager"
                                                    >
                                                        <HiSwitchHorizontal size={15} />
                                                    </button>
                                                    <button
                                                        className="action-btn reset"
                                                        onClick={() => {
                                                            setResettingPromoter(p);
                                                            setShowPasswordResetModal(true);
                                                        }}
                                                        title="Direct Password Reset"
                                                    >
                                                        <HiKey size={15} />
                                                    </button>
                                                    <button
                                                        className="action-btn impersonate"
                                                        onClick={() => handleImpersonate(p)}
                                                        title="Impersonate (Field Camera View)"
                                                    >
                                                        <HiLogin size={15} />
                                                    </button>
                                                    <button
                                                        className={`action-btn toggle ${p.isActive !== false ? 'danger' : 'success'}`}
                                                        onClick={() => handleToggle(p)}
                                                        title={p.isActive !== false ? 'Suspend Account' : 'Activate Account'}
                                                    >
                                                        {p.isActive !== false ? <HiBan size={15} /> : <HiCheck size={15} />}
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
                 PROMOTER DOSSIER DRAWER
               ════════════════════════════════════════════════════════════════ */}
            {showDossierDrawer && (
                <div className="dossier-drawer-backdrop" onClick={() => setShowDossierDrawer(false)}>
                    <div className="dossier-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="drawer-header">
                            <div>
                                <span className="drawer-badge">PROMOTER INTELLIGENCE DOSSIER</span>
                                <h2 className="drawer-title">{selectedDossier?.promoter?.name || 'Loading Promoter...'}</h2>
                                <p className="drawer-subtitle">
                                    {selectedDossier?.promoter?.email} • Agency: {selectedDossier?.manager?.companyName || 'Independent'}
                                </p>
                            </div>
                            <div className="drawer-header-actions">
                                {selectedDossier?.promoter && (
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleImpersonate(selectedDossier.promoter)}
                                    >
                                        <HiLogin size={16} /> Field Test
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
                                <p>Assembling telemetry & performance audit...</p>
                            </div>
                        ) : selectedDossier ? (
                            <div className="drawer-body">
                                {/* Metric Grid */}
                                <div className="dossier-stats-grid">
                                    <div className="dossier-stat-box">
                                        <span className="lbl">Total Batches</span>
                                        <strong className="val">{selectedDossier.metrics.totalBatches}</strong>
                                        <span className="sub">{selectedDossier.metrics.totalPhotos} Photos Total</span>
                                    </div>
                                    <div className="dossier-stat-box">
                                        <span className="lbl">Quality Index</span>
                                        <strong className="val" style={{ color: '#10b981' }}>
                                            {selectedDossier.metrics.qualityScore}%
                                        </strong>
                                        <span className="sub">Face clarity & lighting</span>
                                    </div>
                                    <div className="dossier-stat-box">
                                        <span className="lbl">Approval Rate</span>
                                        <strong className="val" style={{ color: '#0284c7' }}>
                                            {selectedDossier.metrics.approvalRatio}%
                                        </strong>
                                        <span className="sub">{selectedDossier.metrics.approved} Approved</span>
                                    </div>
                                    <div className="dossier-stat-box">
                                        <span className="lbl">Fraud Prevented</span>
                                        <strong className="val" style={{ color: '#f59e0b' }}>
                                            {selectedDossier.metrics.totalDuplicates}
                                        </strong>
                                        <span className="sub">Duplicate attempts flagged</span>
                                    </div>
                                </div>

                                {/* Manager Profile Card */}
                                <div className="dossier-section-card">
                                    <h4 className="card-heading">
                                        <HiOfficeBuilding size={18} /> Assigned Agency & Manager
                                    </h4>
                                    <div className="info-grid">
                                        <div className="info-row">
                                            <span className="info-label">Manager:</span>
                                            <span className="info-value">{selectedDossier.manager?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Company / Agency:</span>
                                            <span className="info-value">{selectedDossier.manager?.companyName || 'Not Set'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Manager Email:</span>
                                            <span className="info-value">{selectedDossier.manager?.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Submissions Stream */}
                                <div className="dossier-section-card">
                                    <h4 className="card-heading">
                                        <HiSparkles size={18} /> Recent Submissions & Field Activity
                                    </h4>
                                    {selectedDossier.recentBatches?.length === 0 ? (
                                        <p className="empty-text">No batch submissions recorded yet.</p>
                                    ) : (
                                        <div className="recent-batches-list">
                                            {selectedDossier.recentBatches.map((b) => (
                                                <div key={b._id} className="recent-batch-card">
                                                    <div>
                                                        <strong className="b-title">{b.title}</strong>
                                                        <div className="b-meta">
                                                            <span>📍 {b.location || 'Unknown location'}</span>
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
                            </div>
                        ) : null}
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
                        <form onSubmit={handleReassign} className="admin-form">
                            <p className="modal-description">
                                Transfer <strong>{promoterToReassign.name}</strong> ({promoterToReassign.email}) to a new manager/agency:
                            </p>
                            <div className="form-group">
                                <label>Destination Manager *</label>
                                <select
                                    required
                                    value={targetManagerId}
                                    onChange={(e) => setTargetManagerId(e.target.value)}
                                >
                                    <option value="">Select Manager / Agency...</option>
                                    {managers
                                        .filter(m => m._id !== promoterToReassign.createdBy?._id)
                                        .map(m => (
                                            <option key={m._id} value={m._id}>
                                                {m.name} ({m.companyName || 'Agency'}) - {m.promotersCreated || 0}/{m.promoterLimit || 5} capacity
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
                 EMERGENCY PASSWORD RESET MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showPasswordResetModal && resettingPromoter && (
                <div className="modal-overlay" onClick={() => setShowPasswordResetModal(false)}>
                    <div className="modal-content sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><HiKey /> Direct Password Override</h3>
                            <button className="close-btn" onClick={() => setShowPasswordResetModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handlePasswordReset} className="admin-form">
                            <p className="modal-description">
                                Set a new password for promoter <strong>{resettingPromoter.name}</strong> ({resettingPromoter.email}).
                            </p>
                            <div className="form-group">
                                <label>New Password *</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Min 6 characters"
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

            <style>{`
                .promoter-intelligence-container {
                    max-width: 1320px;
                    margin: 0 auto;
                    padding-bottom: 40px;
                }

                .page-header {
                    margin-bottom: 24px;
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

                .pulse-indicator-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 10px #10b981;
                    animation: pulse 1.5s infinite;
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
                    flex-wrap: wrap;
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

                .promoters-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .promoters-table th {
                    padding: 14px 18px;
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    border-bottom: 1px solid var(--border-color);
                }

                .promoters-table td {
                    padding: 16px 18px;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.92rem;
                    color: var(--text-primary);
                    vertical-align: middle;
                }

                .promoter-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .avatar-wrapper {
                    position: relative;
                }

                .avatar-box {
                    width: 38px;
                    height: 38px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #10b981, #0d9488);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .live-dot {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2px solid var(--bg-secondary);
                }

                .live-dot.online { background: #10b981; }
                .live-dot.offline { background: #94a3b8; }

                .promoter-link {
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .promoter-link:hover {
                    color: #0d9488;
                    text-decoration: underline;
                }

                .promoter-email {
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                }

                .manager-info-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .agency-tag {
                    color: #0284c7;
                    font-size: 0.82rem;
                    font-weight: 600;
                }

                .scorecard-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.82rem;
                }

                .scorecard-row {
                    display: flex;
                    gap: 6px;
                }

                .quality-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .quality-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    border: 1px solid;
                    background: var(--bg-primary);
                    width: fit-content;
                }

                .fraud-warn-tag {
                    font-size: 0.75rem;
                    color: #b45309;
                    font-weight: 600;
                }

                .telemetry-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.82rem;
                }

                .location-pin {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 600;
                }

                .maps-link {
                    color: #0284c7;
                    font-size: 0.75rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    text-decoration: none;
                }

                .maps-link:hover {
                    text-decoration: underline;
                }

                .status-pill {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 700;
                }

                .status-pill.active { background: #dcfce7; color: #15803d; }
                .status-pill.suspended { background: #fee2e2; color: #b91c1c; }

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

                .action-btn.dossier { background: #0d9488; color: #ffffff; border-color: #0d9488; }
                .action-btn.impersonate { background: #0284c7; color: #ffffff; border-color: #0284c7; }
                .action-btn.toggle.danger { color: #dc2626; }
                .action-btn.toggle.success { color: #16a34a; }

                /* Drawer */
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
                    width: min(650px, 95vw);
                    height: 100vh;
                    background: var(--bg-secondary);
                    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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

                .recent-batch-card {
                    background: var(--bg-secondary);
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

                /* Modal */
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

                .modal-content.sm {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    width: 100%;
                    max-width: 440px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

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
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .admin-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
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

                .form-group input, .form-group select {
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

                .btn-primary.danger { background: #dc2626; }

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

export default AdminPromoters;
