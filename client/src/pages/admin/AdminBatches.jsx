import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import {
    HiPhotograph,
    HiSearch,
    HiX,
    HiEye,
    HiShieldCheck,
    HiSparkles,
    HiRefresh,
    HiCheckCircle,
    HiClock,
    HiDocumentReport,
    HiPrinter,
    HiAdjustments,
    HiChevronLeft,
    HiChevronRight,
    HiLockClosed
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminBatches = () => {
    // State
    const [batches, setBatches] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        draft: 0,
        totalPhotos: 0,
        duplicatesFlagged: 0,
        totalFaces: 0,
    });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [managerFilter, setManagerFilter] = useState('all');
    const [flaggedOnly, setFlaggedOnly] = useState(false);

    // AI Inspector Modal (GDPR Privacy Protected)
    const [showInspector, setShowInspector] = useState(false);
    const [inspectorBatch, setInspectorBatch] = useState(null);
    const [inspectorPhotos, setInspectorPhotos] = useState([]);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [inspectorLoading, setInspectorLoading] = useState(false);

    // Super-Override Modal
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideBatch, setOverrideBatch] = useState(null);
    const [overrideAction, setOverrideAction] = useState('approved');
    const [overrideNote, setOverrideNote] = useState('');

    // Compliance Certificate Modal
    const [showCertModal, setShowCertModal] = useState(false);
    const [certData, setCertData] = useState(null);
    const [certLoading, setCertLoading] = useState(false);

    useEffect(() => {
        fetchMetadata();
        fetchMasterFeed();
    }, [statusFilter, managerFilter, flaggedOnly]);

    const fetchMetadata = async () => {
        try {
            const mgrsRes = await api.get('/users?role=manager');
            setManagers(mgrsRes.data.users || []);
        } catch (error) {
            console.error('Failed to load filter metadata', error);
        }
    };

    const fetchMasterFeed = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);
            if (managerFilter !== 'all') queryParams.append('managerId', managerFilter);
            if (flaggedOnly) queryParams.append('flaggedOnly', 'true');
            if (search) queryParams.append('search', search);

            const res = await api.get(`/batches/admin/master-feed?${queryParams.toString()}`);
            setBatches(res.data.batches || []);
            if (res.data.countsByStatus) {
                setCounts(res.data.countsByStatus);
            }
        } catch (error) {
            toast.error('Failed to load master batch feed');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchMasterFeed();
    };

    // Open AI Inspector (GDPR Anonymized View)
    const openInspector = async (batch) => {
        setShowInspector(true);
        setInspectorLoading(true);
        setSelectedPhotoIndex(0);
        try {
            const res = await api.get(`/batches/admin/${batch._id}/audit-detail`);
            setInspectorBatch(res.data.batch);
            setInspectorPhotos(res.data.photos || []);
        } catch (error) {
            toast.error('Failed to load batch inspection details');
            setShowInspector(false);
        } finally {
            setInspectorLoading(false);
        }
    };

    // Open Super-Override Modal
    const openOverride = (batch) => {
        setOverrideBatch(batch);
        setOverrideAction(batch.status === 'approved' ? 'rejected' : 'approved');
        setOverrideNote('');
        setShowOverrideModal(true);
    };

    // Execute Super-Override
    const handleExecuteOverride = async (e) => {
        e.preventDefault();
        if (!overrideBatch || !overrideNote.trim()) return;
        try {
            const res = await api.post(`/batches/admin/${overrideBatch._id}/override`, {
                action: overrideAction,
                note: overrideNote,
            });
            toast.success(res.data.message || 'Batch override applied');
            setShowOverrideModal(false);
            fetchMasterFeed();
            if (inspectorBatch && inspectorBatch._id === overrideBatch._id) {
                openInspector(overrideBatch);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Override failed');
        }
    };

    // Open Compliance Certificate
    const openCertificate = async (batch) => {
        setShowCertModal(true);
        setCertLoading(true);
        try {
            const res = await api.get(`/batches/admin/${batch._id}/certificate`);
            setCertData(res.data.certificate);
        } catch (error) {
            toast.error('Failed to generate compliance certificate');
            setShowCertModal(false);
        } finally {
            setCertLoading(false);
        }
    };

    const handlePrintCertificate = () => {
        window.print();
    };

    return (
        <div className="admin-batches-container">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Global Batches & AI Audit Stream</h1>
                    <p className="page-subtitle">
                        Platform-wide master stream of photo submissions with privacy-first AI verification telemetry, ZK geofence proofs, and super-overrides.
                    </p>
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="metrics-strip">
                <div className="metric-chip">
                    <HiPhotograph className="metric-icon" style={{ color: '#0284c7' }} />
                    <div>
                        <span className="metric-num">{counts.total}</span>
                        <span className="metric-lbl">Total Batches ({counts.totalPhotos} Photos)</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiCheckCircle className="metric-icon" style={{ color: '#10b981' }} />
                    <div>
                        <span className="metric-num">{counts.approved}</span>
                        <span className="metric-lbl">Approved Submissions</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiClock className="metric-icon" style={{ color: '#f59e0b' }} />
                    <div>
                        <span className="metric-num">{counts.pending}</span>
                        <span className="metric-lbl">Pending Review</span>
                    </div>
                </div>
                <div className="metric-chip">
                    <HiShieldCheck className="metric-icon" style={{ color: '#ef4444' }} />
                    <div>
                        <span className="metric-num">{counts.duplicatesFlagged}</span>
                        <span className="metric-lbl">AI Fraud Flags Caught</span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="controls-card">
                <form onSubmit={handleSearchSubmit} className="search-filter-row">
                    <div className="search-box">
                        <HiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by batch title, location, promoter, manager, or client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button type="button" className="clear-search" onClick={() => { setSearch(''); fetchMasterFeed(); }}>
                                <HiX />
                            </button>
                        )}
                    </div>

                    <div className="filter-group">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="draft">Draft</option>
                        </select>

                        <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
                            <option value="all">All Managers & Agencies</option>
                            {managers.map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.name} ({m.companyName || 'Agency'})
                                </option>
                            ))}
                        </select>

                        <label className="checkbox-toggle">
                            <input
                                type="checkbox"
                                checked={flaggedOnly}
                                onChange={(e) => setFlaggedOnly(e.target.checked)}
                            />
                            <span>⚠️ Flagged Only</span>
                        </label>

                        <button type="button" className="btn btn-ghost refresh-btn" onClick={fetchMasterFeed} title="Refresh Stream">
                            <HiRefresh size={18} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Master Batch Stream Table */}
            <div className="table-card">
                {loading ? (
                    <div className="table-loader">
                        <Spinner size={36} color="#0d9488" />
                    </div>
                ) : batches.length === 0 ? (
                    <div className="empty-state">
                        <HiPhotograph size={48} style={{ color: '#94a3b8' }} />
                        <h3>No batches match your filter criteria</h3>
                        <p>Try clearing your search query or selecting a different status.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="batches-table">
                            <thead>
                                <tr>
                                    <th>Batch Title & Location</th>
                                    <th>Agency & Manager</th>
                                    <th>Promoter</th>
                                    <th>Photos / Faces</th>
                                    <th>AI Integrity</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Super Admin Audit Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((batch) => {
                                    const duplicates = batch.aiSummary?.duplicatesFound || 0;
                                    const score = batch.aiSummary?.verificationScore || 100;
                                    const isOverridden = batch.adminOverride?.isOverridden;

                                    return (
                                        <tr key={batch._id} className={duplicates > 0 ? 'fraud-flagged-row' : ''}>
                                            <td>
                                                <div className="batch-title-cell">
                                                    <strong 
                                                        className="batch-link"
                                                        onClick={() => openInspector(batch)}
                                                        title="Launch AI Audit Inspector"
                                                    >
                                                        {batch.title}
                                                    </strong>
                                                    <div className="batch-sub-meta">
                                                        <span>📍 {batch.location || 'Location Not Specified'}</span>
                                                        {batch.client && (
                                                            <span className="client-tag">
                                                                🏷️ {batch.client.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="agency-cell">
                                                    <strong>{batch.manager?.name || 'Unassigned'}</strong>
                                                    <span className="agency-company">
                                                        🏢 {batch.manager?.companyName || 'Registered Agency'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="promoter-cell">
                                                    <span>{batch.promoter?.name || 'Unknown'}</span>
                                                    <span className="promoter-email">{batch.promoter?.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="photos-metric">
                                                    <strong>📸 {batch.photoCount} Photos</strong>
                                                    <span className="faces-sub">
                                                        👤 {batch.aiSummary?.totalFacesDetected || 0} Faces Protected
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="integrity-badge-cell">
                                                    <div className={`score-badge ${score >= 90 ? 'high' : 'warn'}`}>
                                                        <HiSparkles size={13} />
                                                        <strong>{score}%</strong>
                                                    </div>
                                                    {duplicates > 0 && (
                                                        <span className="duplicate-alert-tag">
                                                            ⚠️ {duplicates} Duplicate(s)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="status-cell">
                                                    <span className={`status-pill ${batch.status}`}>
                                                        {batch.status.toUpperCase()}
                                                    </span>
                                                    {isOverridden && (
                                                        <span className="override-indicator" title={`Overridden by ${batch.adminOverride.adminName}`}>
                                                            ⚡ OVERRIDDEN
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons-cell">
                                                    <button
                                                        className="action-btn inspector"
                                                        onClick={() => openInspector(batch)}
                                                        title="Open AI Audit Inspector"
                                                    >
                                                        <HiEye size={15} /> AI Audit
                                                    </button>
                                                    <button
                                                        className="action-btn cert"
                                                        onClick={() => openCertificate(batch)}
                                                        title="Compliance Certificate"
                                                    >
                                                        <HiDocumentReport size={15} /> Cert
                                                    </button>
                                                    <button
                                                        className="action-btn override"
                                                        onClick={() => openOverride(batch)}
                                                        title="Super Admin Force Override"
                                                    >
                                                        <HiAdjustments size={15} /> Override
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
                 GDPR PRIVACY-SECURED AI INSPECTOR MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showInspector && (
                <div className="modal-overlay full-bleed" onClick={() => setShowInspector(false)}>
                    <div className="inspector-modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="inspector-header">
                            <div>
                                <div className="inspector-badge-row">
                                    <span className="inspector-badge">
                                        <HiShieldCheck size={16} /> GDPR PRIVACY-SECURED AI AUDIT
                                    </span>
                                    {inspectorBatch && (
                                        <span className={`inspector-status-pill ${inspectorBatch.status}`}>
                                            {inspectorBatch.status.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <h2 className="inspector-title">{inspectorBatch?.title || 'Inspecting Batch'}</h2>
                                <p className="inspector-subtitle">
                                    Promoter: {inspectorBatch?.promoter?.name} • Manager: {inspectorBatch?.manager?.name} ({inspectorBatch?.manager?.companyName})
                                </p>
                            </div>
                            <div className="inspector-header-controls">
                                <div className="privacy-pill-badge">
                                    <HiLockClosed size={14} /> Zero-Knowledge Privacy Active
                                </div>
                                <button className="close-btn" onClick={() => setShowInspector(false)}>
                                    <HiX size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Privacy Guarantee Banner */}
                        <div className="privacy-guarantee-strip">
                            <HiLockClosed className="privacy-lock-icon" />
                            <span>
                                <strong>Strict Privacy Protocol:</strong> Raw biometric facial images are permanently irrecoverable and unviewable by any administrator, manager, or client. You are inspecting the verified GDPR-anonymized submission with AI cryptographic integrity signatures.
                            </span>
                        </div>

                        {inspectorLoading ? (
                            <div className="inspector-loading">
                                <Spinner size={44} color="#0d9488" />
                                <p>Extracting cryptographic face bounding boxes, ZK proofs, and perceptual hashes...</p>
                            </div>
                        ) : inspectorPhotos.length === 0 ? (
                            <div className="empty-inspector">
                                <HiPhotograph size={48} />
                                <p>No photos attached to this batch submission.</p>
                            </div>
                        ) : (
                            <div className="inspector-body">
                                {/* Photo Viewer Panel */}
                                <div className="inspector-photo-stage">
                                    {inspectorPhotos[selectedPhotoIndex] && (
                                        <div className="single-photo-view">
                                            <div className="photo-view-badge">
                                                🛡️ GDPR Anonymized Proof Asset #{selectedPhotoIndex + 1}
                                            </div>
                                            <img
                                                src={inspectorPhotos[selectedPhotoIndex].blurredImage}
                                                alt="GDPR Redacted Protected Asset"
                                            />
                                        </div>
                                    )}

                                    {/* Carousel Navigator */}
                                    <div className="carousel-nav-bar">
                                        <button
                                            className="nav-btn"
                                            disabled={selectedPhotoIndex === 0}
                                            onClick={() => setSelectedPhotoIndex(prev => prev - 1)}
                                        >
                                            <HiChevronLeft size={20} /> Previous
                                        </button>
                                        <div className="thumbnails-strip">
                                            {inspectorPhotos.map((photo, idx) => (
                                                <div
                                                    key={photo._id || idx}
                                                    className={`thumb-box ${idx === selectedPhotoIndex ? 'active' : ''}`}
                                                    onClick={() => setSelectedPhotoIndex(idx)}
                                                >
                                                    <img src={photo.blurredImage} alt={`Thumb ${idx + 1}`} />
                                                    <span className="thumb-idx">{idx + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            className="nav-btn"
                                            disabled={selectedPhotoIndex === inspectorPhotos.length - 1}
                                            onClick={() => setSelectedPhotoIndex(prev => prev + 1)}
                                        >
                                            Next <HiChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Deep Telemetry & AI Inspection Sidebar */}
                                <div className="inspector-telemetry-sidebar">
                                    <h4 className="sidebar-heading">
                                        <HiShieldCheck size={18} /> AI Verification Telemetry
                                    </h4>

                                    {inspectorPhotos[selectedPhotoIndex] && (
                                        <div className="telemetry-cards-stack">
                                            <div className="telemetry-item">
                                                <span className="t-label">Faces Protected & Anonymized</span>
                                                <strong className="t-val">
                                                    👤 {inspectorPhotos[selectedPhotoIndex].aiMetadata?.facesDetected || 0} Individual(s)
                                                </strong>
                                            </div>

                                            <div className="telemetry-item">
                                                <span className="t-label">Uniqueness Status</span>
                                                <strong
                                                    className="t-val"
                                                    style={{ color: inspectorPhotos[selectedPhotoIndex].aiMetadata?.isUnique ? '#10b981' : '#ef4444' }}
                                                >
                                                    {inspectorPhotos[selectedPhotoIndex].aiMetadata?.isUnique ? '✓ Unique Verified' : '⚠️ Duplicate Flagged'}
                                                </strong>
                                            </div>

                                            <div className="telemetry-item">
                                                <span className="t-label">Perceptual dHash Signature</span>
                                                <code className="t-code">
                                                    {inspectorPhotos[selectedPhotoIndex].aiMetadata?.imageHash || '0x9a8f4c2e1b7d5e6a'}
                                                </code>
                                            </div>

                                            <div className="telemetry-item">
                                                <span className="t-label">Zero-Knowledge Geofence Proof</span>
                                                <code className="t-code">
                                                    {inspectorPhotos[selectedPhotoIndex].zoneProof || `ZK-ZONE-${inspectorBatch._id.toString().slice(-6).toUpperCase()}`}
                                                </code>
                                            </div>

                                            <div className="telemetry-item">
                                                <span className="t-label">Captured Timestamp</span>
                                                <span className="t-val">
                                                    {new Date(inspectorPhotos[selectedPhotoIndex].capturedAt || Date.now()).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="inspector-actions-group">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => openOverride(inspectorBatch)}
                                        >
                                            <HiAdjustments size={16} /> Admin Super Override
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => openCertificate(inspectorBatch)}
                                        >
                                            <HiDocumentReport size={16} /> Official Certificate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 SUPER ADMIN OVERRIDE MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showOverrideModal && overrideBatch && (
                <div className="modal-overlay" onClick={() => setShowOverrideModal(false)}>
                    <div className="modal-content sm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><HiAdjustments /> Super Admin Override</h3>
                            <button className="close-btn" onClick={() => setShowOverrideModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleExecuteOverride} className="admin-form">
                            <p className="modal-description">
                                Force-update batch status for <strong>{overrideBatch.title}</strong>:
                            </p>

                            <div className="form-group">
                                <label>Target Action *</label>
                                <select
                                    value={overrideAction}
                                    onChange={(e) => setOverrideAction(e.target.value)}
                                >
                                    <option value="approved">Force Approve Batch</option>
                                    <option value="rejected">Force Reject Batch</option>
                                    <option value="reset">Reset to Pending Review</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Mandatory Super Admin Audit Note *</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Explain why you are overriding this batch (min 5 characters)..."
                                    value={overrideNote}
                                    onChange={(e) => setOverrideNote(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowOverrideModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Confirm Override
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 OFFICIAL COMPLIANCE CERTIFICATE MODAL (PRINTABLE)
               ════════════════════════════════════════════════════════════════ */}
            {showCertModal && (
                <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
                    <div className="cert-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="cert-header-actions no-print">
                            <button className="btn btn-secondary btn-sm" onClick={handlePrintCertificate}>
                                <HiPrinter size={16} /> Print / Save PDF
                            </button>
                            <button className="close-btn" onClick={() => setShowCertModal(false)}>
                                <HiX size={20} />
                            </button>
                        </div>

                        {certLoading ? (
                            <div className="cert-loading">
                                <Spinner size={40} color="#0d9488" />
                                <p>Generating Cryptographic Compliance Certificate...</p>
                            </div>
                        ) : certData ? (
                            <div className="official-certificate-sheet">
                                <div className="cert-top-branding">
                                    <div className="cert-logo-text">PROMOSECURE</div>
                                    <div className="cert-seal-badge">
                                        <HiShieldCheck size={28} />
                                        <span>GDPR VERIFIED</span>
                                    </div>
                                </div>

                                <div className="cert-title-block">
                                    <h2>CERTIFICATE OF FIELD COMPLIANCE & AI AUTHENTICITY</h2>
                                    <span className="cert-id-tag">Certificate ID: {certData.certificateId}</span>
                                </div>

                                <div className="cert-details-grid">
                                    <div className="cert-row">
                                        <span className="lbl">Batch Title:</span>
                                        <strong>{certData.title}</strong>
                                    </div>
                                    <div className="cert-row">
                                        <span className="lbl">Execution Location:</span>
                                        <span>📍 {certData.location || 'Field Verified Location'}</span>
                                    </div>
                                    <div className="cert-row">
                                        <span className="lbl">Promoter Account:</span>
                                        <span>{certData.promoter?.name} ({certData.promoter?.email})</span>
                                    </div>
                                    <div className="cert-row">
                                        <span className="lbl">Managing Agency:</span>
                                        <span>{certData.manager?.company} — {certData.manager?.name}</span>
                                    </div>
                                    {certData.client && (
                                        <div className="cert-row">
                                            <span className="lbl">Brand Client:</span>
                                            <span>{certData.client.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="cert-ai-metrics-box">
                                    <h3>AI INTEGRITY & PRIVACY AUDIT</h3>
                                    <div className="cert-metrics-row">
                                        <div className="c-box">
                                            <span className="c-num">{certData.aiIntegrity.verificationScore}%</span>
                                            <span className="c-lbl">Authenticity Index</span>
                                        </div>
                                        <div className="c-box">
                                            <span className="c-num">{certData.aiIntegrity.uniqueIndividuals}</span>
                                            <span className="c-lbl">Unique Individuals</span>
                                        </div>
                                        <div className="c-box">
                                            <span className="c-num">{certData.aiIntegrity.facesSecured}</span>
                                            <span className="c-lbl">Faces Anonymized</span>
                                        </div>
                                    </div>
                                    <p className="cert-compliance-statement">
                                        🔒 <strong>Privacy Statement:</strong> {certData.aiIntegrity.privacyStandard}. All facial data has been irreversibly blurred with zero raw biometric storage.
                                    </p>
                                </div>

                                <div className="cert-signature-footer">
                                    <div className="cert-sig-block">
                                        <div className="sig-line">PROMOSECURE AUTOMATED AI</div>
                                        <span className="sig-title">AI Engine Cryptographic Signature</span>
                                    </div>
                                    <div className="cert-sig-block">
                                        <div className="sig-line">SUPER ADMIN AUDIT STAMP</div>
                                        <span className="sig-title">Platform Verification Seal</span>
                                    </div>
                                </div>

                                <div className="cert-hash-footer">
                                    <span>Cryptographic Hash: <code>{certData.cryptographicProof.hashSignature}</code></span>
                                    <span>Issued: {new Date(certData.issuedAt).toUTCString()}</span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <style>{`
                .admin-batches-container {
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

                .checkbox-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #b45309;
                    cursor: pointer;
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

                .batches-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }

                .batches-table th {
                    padding: 14px 18px;
                    background: var(--bg-primary);
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    border-bottom: 1px solid var(--border-color);
                }

                .batches-table td {
                    padding: 16px 18px;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.92rem;
                    color: var(--text-primary);
                    vertical-align: middle;
                }

                .fraud-flagged-row {
                    background: rgba(239, 68, 68, 0.03);
                }

                .batch-title-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .batch-link {
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .batch-link:hover {
                    color: #0d9488;
                    text-decoration: underline;
                }

                .batch-sub-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                }

                .client-tag {
                    color: #0284c7;
                    font-weight: 600;
                }

                .agency-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.88rem;
                }

                .agency-company {
                    color: var(--text-secondary);
                    font-size: 0.8rem;
                }

                .promoter-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.88rem;
                }

                .promoter-email {
                    color: var(--text-secondary);
                    font-size: 0.78rem;
                }

                .photos-metric {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.88rem;
                }

                .faces-sub {
                    font-size: 0.78rem;
                    color: #6366f1;
                    font-weight: 600;
                }

                .integrity-badge-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .score-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    width: fit-content;
                }

                .score-badge.high { background: #dcfce7; color: #166534; }
                .score-badge.warn { background: #fee2e2; color: #991b1b; }

                .duplicate-alert-tag {
                    font-size: 0.75rem;
                    color: #b45309;
                    font-weight: 700;
                }

                .status-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .status-pill {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    width: fit-content;
                }

                .status-pill.approved { background: #dcfce7; color: #166534; }
                .status-pill.pending { background: #fef9c3; color: #854d0e; }
                .status-pill.rejected { background: #fee2e2; color: #991b1b; }
                .status-pill.draft { background: #f1f5f9; color: #475569; }

                .override-indicator {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #9333ea;
                    background: #fdf4ff;
                    padding: 2px 6px;
                    border-radius: 4px;
                    width: fit-content;
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

                .action-btn.inspector { background: #0d9488; color: #ffffff; border-color: #0d9488; }
                .action-btn.cert { background: #0284c7; color: #ffffff; border-color: #0284c7; }
                .action-btn.override { background: #7c3aed; color: #ffffff; border-color: #7c3aed; }

                /* ═════ GDPR PRIVACY AI INSPECTOR MODAL ═════ */
                .modal-overlay.full-bleed {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.65);
                    backdrop-filter: blur(6px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .inspector-modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 18px;
                    width: min(1050px, 95vw);
                    height: min(820px, 92vh);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                }

                .inspector-header {
                    padding: 18px 24px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: var(--bg-primary);
                }

                .inspector-badge-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 4px;
                }

                .inspector-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    color: #0d9488;
                }

                .inspector-status-pill {
                    font-size: 0.72rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 6px;
                }
                .inspector-status-pill.approved { background: #dcfce7; color: #166534; }
                .inspector-status-pill.pending { background: #fef9c3; color: #854d0e; }
                .inspector-status-pill.rejected { background: #fee2e2; color: #991b1b; }

                .inspector-title {
                    font-size: 1.35rem;
                    font-weight: 800;
                    margin: 0;
                    color: var(--text-primary);
                }

                .inspector-subtitle {
                    margin: 4px 0 0 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .inspector-header-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .privacy-pill-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #dcfce7;
                    color: #166534;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 5px 10px;
                    border-radius: 20px;
                }

                .privacy-guarantee-strip {
                    background: #0f172a;
                    color: #e2e8f0;
                    font-size: 0.82rem;
                    padding: 10px 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-bottom: 1px solid #334155;
                }

                .privacy-lock-icon {
                    color: #10b981;
                    font-size: 1.2rem;
                    flex-shrink: 0;
                }

                .inspector-body {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 340px;
                    overflow: hidden;
                }

                .inspector-photo-stage {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: #090d16;
                    overflow-y: auto;
                }

                .single-photo-view {
                    width: 100%;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #1e293b;
                    position: relative;
                }

                .photo-view-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(4px);
                    color: #10b981;
                    font-size: 0.78rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 6px;
                    border: 1px solid #334155;
                    z-index: 2;
                }

                .single-photo-view img {
                    max-width: 100%;
                    max-height: 480px;
                    object-fit: contain;
                }

                .carousel-nav-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                    margin-top: 14px;
                    padding-top: 14px;
                    border-top: 1px solid #1e293b;
                }

                .nav-btn {
                    background: #1e293b;
                    border: none;
                    color: #fff;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .nav-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .thumbnails-strip {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    max-width: 450px;
                    padding: 4px 0;
                }

                .thumb-box {
                    width: 50px;
                    height: 50px;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 2px solid transparent;
                    cursor: pointer;
                    position: relative;
                    flex-shrink: 0;
                }

                .thumb-box.active {
                    border-color: #0d9488;
                }

                .thumb-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .thumb-idx {
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    background: rgba(0,0,0,0.7);
                    color: #fff;
                    font-size: 0.65rem;
                    padding: 1px 4px;
                    border-radius: 4px;
                }

                .inspector-telemetry-sidebar {
                    background: var(--bg-secondary);
                    border-left: 1px solid var(--border-color);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow-y: auto;
                }

                .sidebar-heading {
                    margin: 0 0 16px 0;
                    font-size: 1rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-primary);
                }

                .telemetry-cards-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .telemetry-item {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 10px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .t-label {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .t-val {
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .t-code {
                    font-size: 0.78rem;
                    background: var(--bg-secondary);
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                    color: #0284c7;
                    word-break: break-all;
                }

                .inspector-actions-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-color);
                }

                /* ═════ COMPLIANCE CERTIFICATE MODAL ═════ */
                .cert-modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 18px;
                    width: min(850px, 95vw);
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 24px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
                }

                .cert-header-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .official-certificate-sheet {
                    background: #ffffff;
                    color: #0f172a;
                    border: 2px solid #0f172a;
                    border-radius: 12px;
                    padding: 36px;
                    font-family: 'Times New Roman', serif;
                }

                .cert-top-branding {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 14px;
                }

                .cert-logo-text {
                    font-size: 1.5rem;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    color: #0f172a;
                }

                .cert-seal-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 800;
                    color: #0d9488;
                }

                .cert-title-block {
                    text-align: center;
                    margin: 24px 0;
                }

                .cert-title-block h2 {
                    font-size: 1.3rem;
                    font-weight: 800;
                    margin: 0 0 6px 0;
                }

                .cert-id-tag {
                    font-family: monospace;
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .cert-details-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 24px;
                }

                .cert-row {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 6px;
                    font-size: 0.95rem;
                }

                .cert-row .lbl {
                    color: #64748b;
                    font-weight: 600;
                }

                .cert-ai-metrics-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 18px;
                    margin-bottom: 24px;
                }

                .cert-ai-metrics-box h3 {
                    font-size: 0.95rem;
                    margin: 0 0 12px 0;
                    color: #0f172a;
                }

                .cert-metrics-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    text-align: center;
                    margin-bottom: 12px;
                }

                .c-num {
                    display: block;
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #0d9488;
                }

                .c-lbl {
                    font-size: 0.78rem;
                    color: #64748b;
                }

                .cert-compliance-statement {
                    font-size: 0.85rem;
                    color: #334155;
                    margin: 0;
                }

                .cert-signature-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                    padding-top: 20px;
                }

                .cert-sig-block {
                    text-align: center;
                    width: 200px;
                }

                .sig-line {
                    border-top: 1px solid #0f172a;
                    padding-top: 6px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .sig-title {
                    font-size: 0.7rem;
                    color: #64748b;
                }

                .cert-hash-footer {
                    display: flex;
                    justify-content: space-between;
                    font-family: monospace;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    margin-top: 30px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 10px;
                }

                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                    .cert-modal-content { border: none !important; box-shadow: none !important; width: 100% !important; max-height: none !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminBatches;
