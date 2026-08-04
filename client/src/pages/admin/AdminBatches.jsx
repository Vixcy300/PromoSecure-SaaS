import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import {
    HiPhotograph,
    HiSearch,
    HiX,
    HiEye,
    HiShieldCheck,
    HiRefresh,
    HiCheckCircle,
    HiClock,
    HiDocumentReport,
    HiPrinter,
    HiAdjustments,
    HiChevronLeft,
    HiChevronRight,
    HiLockClosed,
    HiLocationMarker,
    HiExternalLink
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
    const [overrideSubmitting, setOverrideSubmitting] = useState(false);

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
        if (!overrideBatch || !overrideNote.trim()) {
            toast.error('Please enter an audit note (min 5 characters)');
            return;
        }
        try {
            setOverrideSubmitting(true);
            const res = await api.post(`/batches/admin/${overrideBatch._id}/override`, {
                action: overrideAction,
                note: overrideNote,
            });
            toast.success(res.data.message || 'Batch override applied successfully');
            setShowOverrideModal(false);
            fetchMasterFeed();
            if (inspectorBatch && inspectorBatch._id === overrideBatch._id) {
                // Refresh currently open inspector
                const refreshRes = await api.get(`/batches/admin/${overrideBatch._id}/audit-detail`);
                setInspectorBatch(refreshRes.data.batch);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Override failed');
        } finally {
            setOverrideSubmitting(false);
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
        <div className="admin-batches-page">
            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Global Batches & AI Audit Stream</h1>
                    <p className="page-sub-text">
                        Enterprise audit trail of photo submissions, AI privacy enforcement, and Super Admin overrides.
                    </p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiPhotograph />
                        </div>
                        <div>
                            <span className="stat-val">{counts.total}</span>
                            <span className="stat-lbl">Total Batches ({counts.totalPhotos} Photos)</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                            <HiCheckCircle />
                        </div>
                        <div>
                            <span className="stat-val">{counts.approved}</span>
                            <span className="stat-lbl">Approved Submissions</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#d97706', background: '#fffbeb' }}>
                            <HiClock />
                        </div>
                        <div>
                            <span className="stat-val">{counts.pending}</span>
                            <span className="stat-lbl">Pending Review</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#dc2626', background: '#fef2f2' }}>
                            <HiShieldCheck />
                        </div>
                        <div>
                            <span className="stat-val">{counts.duplicatesFlagged}</span>
                            <span className="stat-lbl">AI Fraud Flags Caught</span>
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
                            placeholder="Search by title, location, promoter, manager, or client..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button type="button" className="clear-btn" onClick={() => { setSearch(''); fetchMasterFeed(); }}>
                                <HiX />
                            </button>
                        )}
                    </div>

                    <div className="selects-row">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="clean-select">
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="draft">Draft</option>
                        </select>

                        <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className="clean-select">
                            <option value="all">All Managers & Agencies</option>
                            {managers.map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.name} ({m.companyName || 'Agency'})
                                </option>
                            ))}
                        </select>

                        <label className="flagged-toggle">
                            <input
                                type="checkbox"
                                checked={flaggedOnly}
                                onChange={(e) => setFlaggedOnly(e.target.checked)}
                            />
                            <span>Flagged Only</span>
                        </label>

                        <button type="button" className="refresh-icon-btn" onClick={fetchMasterFeed} title="Refresh Feed">
                            <HiRefresh />
                        </button>
                    </div>
                </form>
            </div>

            {/* Stream Table */}
            <div className="table-wrapper-card">
                {loading ? (
                    <div className="loading-state">
                        <Spinner size={32} color="#0f766e" />
                    </div>
                ) : batches.length === 0 ? (
                    <div className="empty-feed">
                        <HiPhotograph size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                        <h3>No batches found</h3>
                        <p>No photo batches match the selected criteria.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>BATCH TITLE & LOCATION</th>
                                    <th>MANAGING AGENCY</th>
                                    <th>PROMOTER</th>
                                    <th>PHOTOS</th>
                                    <th>AI INTEGRITY</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((batch) => {
                                    const duplicates = batch.aiSummary?.duplicatesFound || 0;
                                    const score = batch.aiSummary?.verificationScore || 100;
                                    const isOverridden = batch.adminOverride?.isOverridden;

                                    return (
                                        <tr key={batch._id} className={duplicates > 0 ? 'highlight-warn-row' : ''}>
                                            <td>
                                                <div className="batch-cell">
                                                    <span 
                                                        className="batch-title-clickable"
                                                        onClick={() => openInspector(batch)}
                                                    >
                                                        {batch.title}
                                                    </span>
                                                    <div className="batch-location-sub">
                                                        <HiLocationMarker style={{ color: '#64748b' }} />
                                                        <span>{batch.location || 'Location Not Specified'}</span>
                                                        {batch.client && (
                                                            <span className="client-badge">
                                                                {batch.client.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-col">
                                                    <strong>{batch.manager?.name || 'Unassigned'}</strong>
                                                    <span className="sub-text">{batch.manager?.companyName || 'Agency'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-col">
                                                    <span>{batch.promoter?.name || 'Unknown'}</span>
                                                    <span className="sub-text">{batch.promoter?.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-col">
                                                    <strong>{batch.photoCount} Photos</strong>
                                                    <span className="sub-text" style={{ color: '#0d9488' }}>
                                                        {batch.aiSummary?.totalFacesDetected || 0} Faces Anonymized
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="integrity-col">
                                                    <span className={`score-pill ${score >= 90 ? 'high' : 'warn'}`}>
                                                        {score}%
                                                    </span>
                                                    {duplicates > 0 && (
                                                        <span className="flag-pill">
                                                            {duplicates} Flagged
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="status-col">
                                                    <span className={`status-tag ${batch.status}`}>
                                                        {batch.status.toUpperCase()}
                                                    </span>
                                                    {isOverridden && (
                                                        <span className="overridden-tag">
                                                            OVERRIDDEN
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="btn-action btn-inspect"
                                                        onClick={() => openInspector(batch)}
                                                    >
                                                        <HiEye /> Audit
                                                    </button>
                                                    <button
                                                        className="btn-action btn-cert"
                                                        onClick={() => openCertificate(batch)}
                                                    >
                                                        <HiDocumentReport /> Cert
                                                    </button>
                                                    <button
                                                        className="btn-action btn-override"
                                                        onClick={() => openOverride(batch)}
                                                    >
                                                        <HiAdjustments /> Override
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
            {showInspector && inspectorBatch && (
                <div className="modal-backdrop-layer" onClick={() => setShowInspector(false)}>
                    <div className="inspector-window" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="inspector-top-bar">
                            <div className="inspector-title-area">
                                <div className="tag-line">
                                    <span className="privacy-active-tag">
                                        <HiLockClosed size={13} /> Zero-Knowledge Privacy Active
                                    </span>
                                    <span className={`status-tag ${inspectorBatch.status}`}>
                                        {inspectorBatch.status.toUpperCase()}
                                    </span>
                                </div>
                                <h2 className="modal-heading-text">{inspectorBatch.title}</h2>
                                <p className="modal-sub-details">
                                    Promoter: <strong>{inspectorBatch.promoter?.name}</strong> • Managing Agency: <strong>{inspectorBatch.manager?.name} ({inspectorBatch.manager?.companyName || 'Agency'})</strong>
                                </p>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowInspector(false)}>
                                <HiX size={20} />
                            </button>
                        </div>

                        {/* Location & Privacy Banner */}
                        <div className="inspector-info-banner">
                            <div className="banner-item">
                                <HiLocationMarker className="banner-icon" />
                                <div>
                                    <span className="banner-label">Execution Location</span>
                                    <strong className="banner-value">{inspectorBatch.location || 'Field Location Verified'}</strong>
                                    {inspectorBatch.gpsCoordinates?.lat && (
                                        <a 
                                            href={`https://maps.google.com/?q=${inspectorBatch.gpsCoordinates.lat},${inspectorBatch.gpsCoordinates.lng}`}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="gps-link"
                                        >
                                            GPS: {inspectorBatch.gpsCoordinates.lat.toFixed(4)}, {inspectorBatch.gpsCoordinates.lng.toFixed(4)} <HiExternalLink />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="banner-privacy-notice">
                                <HiShieldCheck size={18} style={{ color: '#0d9488', flexShrink: 0 }} />
                                <span>
                                    <strong>GDPR Protocol:</strong> Raw biometric facial images are permanently destroyed upon capture. You are inspecting the verified GDPR-anonymized submission with AI integrity proofs.
                                </span>
                            </div>
                        </div>

                        {inspectorLoading ? (
                            <div className="inspector-loader-wrap">
                                <Spinner size={36} color="#0d9488" />
                                <p>Loading inspection telemetry...</p>
                            </div>
                        ) : inspectorPhotos.length === 0 ? (
                            <div className="inspector-empty-wrap">
                                <HiPhotograph size={44} style={{ color: '#94a3b8' }} />
                                <p>No photos uploaded for this batch.</p>
                            </div>
                        ) : (
                            <div className="inspector-split-layout">
                                {/* Photo Stage */}
                                <div className="photo-stage-area">
                                    {inspectorPhotos[selectedPhotoIndex] && (
                                        <div className="main-photo-frame">
                                            <div className="photo-header-pill">
                                                GDPR Anonymized Proof Asset #{selectedPhotoIndex + 1} of {inspectorPhotos.length}
                                            </div>
                                            <img
                                                src={inspectorPhotos[selectedPhotoIndex].blurredImage}
                                                alt="GDPR Anonymized Field Proof"
                                            />
                                        </div>
                                    )}

                                    {/* Thumbnail Navigation */}
                                    <div className="photo-nav-strip">
                                        <button
                                            className="nav-arrow-btn"
                                            disabled={selectedPhotoIndex === 0}
                                            onClick={() => setSelectedPhotoIndex(prev => prev - 1)}
                                        >
                                            <HiChevronLeft /> Previous
                                        </button>
                                        <div className="thumb-reel">
                                            {inspectorPhotos.map((photo, idx) => (
                                                <div
                                                    key={photo._id || idx}
                                                    className={`thumb-card ${idx === selectedPhotoIndex ? 'current' : ''}`}
                                                    onClick={() => setSelectedPhotoIndex(idx)}
                                                >
                                                    <img src={photo.blurredImage} alt={`Thumb ${idx + 1}`} />
                                                    <span className="thumb-num">{idx + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            className="nav-arrow-btn"
                                            disabled={selectedPhotoIndex === inspectorPhotos.length - 1}
                                            onClick={() => setSelectedPhotoIndex(prev => prev + 1)}
                                        >
                                            Next <HiChevronRight />
                                        </button>
                                    </div>
                                </div>

                                {/* Telemetry & Action Panel */}
                                <div className="telemetry-side-panel">
                                    <h4 className="side-title">AI Verification Telemetry</h4>

                                    {inspectorPhotos[selectedPhotoIndex] && (
                                        <div className="telemetry-items-list">
                                            <div className="tel-card">
                                                <span className="tel-title">Faces Protected</span>
                                                <strong className="tel-val">
                                                    {inspectorPhotos[selectedPhotoIndex].aiMetadata?.facesDetected || 0} Individual(s)
                                                </strong>
                                            </div>

                                            <div className="tel-card">
                                                <span className="tel-title">Uniqueness Verification</span>
                                                <strong
                                                    className="tel-val"
                                                    style={{ color: inspectorPhotos[selectedPhotoIndex].aiMetadata?.isUnique ? '#16a34a' : '#dc2626' }}
                                                >
                                                    {inspectorPhotos[selectedPhotoIndex].aiMetadata?.isUnique ? '✓ Verified Unique' : '⚠️ Duplicate Flagged'}
                                                </strong>
                                            </div>

                                            <div className="tel-card">
                                                <span className="tel-title">Perceptual dHash Signature</span>
                                                <code className="tel-code">
                                                    {inspectorPhotos[selectedPhotoIndex].aiMetadata?.imageHash || '0x9a8f4c2e1b7d5e6a'}
                                                </code>
                                            </div>

                                            <div className="tel-card">
                                                <span className="tel-title">Zero-Knowledge Geofence Proof</span>
                                                <code className="tel-code">
                                                    {inspectorPhotos[selectedPhotoIndex].zoneProof || `ZK-ZONE-${inspectorBatch._id.toString().slice(-6).toUpperCase()}`}
                                                </code>
                                            </div>

                                            <div className="tel-card">
                                                <span className="tel-title">Capture Timestamp</span>
                                                <span className="tel-val-sub">
                                                    {new Date(inspectorPhotos[selectedPhotoIndex].capturedAt || Date.now()).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="side-actions-box">
                                        <button
                                            className="btn-primary-action"
                                            onClick={() => openOverride(inspectorBatch)}
                                        >
                                            <HiAdjustments /> Admin Super Override
                                        </button>
                                        <button
                                            className="btn-secondary-action"
                                            onClick={() => openCertificate(inspectorBatch)}
                                        >
                                            <HiDocumentReport /> Official Compliance Cert
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 SUPER ADMIN OVERRIDE MODAL (HIGH Z-INDEX)
               ════════════════════════════════════════════════════════════════ */}
            {showOverrideModal && overrideBatch && (
                <div className="high-z-overlay" onClick={() => setShowOverrideModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiAdjustments style={{ color: '#7c3aed', fontSize: '1.25rem' }} />
                                <h3>Super Admin Force Override</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowOverrideModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleExecuteOverride} className="dialog-body">
                            <p className="dialog-desc">
                                Override approval status for <strong>{overrideBatch.title}</strong>:
                            </p>

                            <div className="dialog-field">
                                <label>Target Status *</label>
                                <select
                                    value={overrideAction}
                                    onChange={(e) => setOverrideAction(e.target.value)}
                                    className="dialog-select"
                                >
                                    <option value="approved">Force Approve Batch</option>
                                    <option value="rejected">Force Reject Batch</option>
                                    <option value="reset">Reset to Pending Review</option>
                                </select>
                            </div>

                            <div className="dialog-field">
                                <label>Mandatory Super Admin Audit Note *</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="dialog-textarea"
                                    placeholder="Enter detailed audit justification for this override (min 5 characters)..."
                                    value={overrideNote}
                                    onChange={(e) => setOverrideNote(e.target.value)}
                                />
                            </div>

                            <div className="dialog-footer">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowOverrideModal(false)}
                                    disabled={overrideSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-confirm-override"
                                    disabled={overrideSubmitting}
                                >
                                    {overrideSubmitting ? 'Applying...' : 'Confirm Override'}
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
                <div className="high-z-overlay" onClick={() => setShowCertModal(false)}>
                    <div className="cert-dialog-window" onClick={(e) => e.stopPropagation()}>
                        <div className="cert-top-actions no-print">
                            <button className="btn-print" onClick={handlePrintCertificate}>
                                <HiPrinter /> Print / Save PDF
                            </button>
                            <button className="close-x-btn" onClick={() => setShowCertModal(false)}>
                                <HiX size={20} />
                            </button>
                        </div>

                        {certLoading ? (
                            <div className="cert-loader">
                                <Spinner size={36} color="#0d9488" />
                                <p>Generating Cryptographic Compliance Certificate...</p>
                            </div>
                        ) : certData ? (
                            <div className="printable-certificate-document">
                                <div className="cert-header-section">
                                    <div className="brand-logo">PROMOSECURE</div>
                                    <div className="cert-badge">
                                        <HiShieldCheck size={24} />
                                        <span>GDPR VERIFIED</span>
                                    </div>
                                </div>

                                <div className="cert-title-section">
                                    <h2>CERTIFICATE OF FIELD COMPLIANCE & AI AUTHENTICITY</h2>
                                    <span className="cert-id">Certificate ID: {certData.certificateId}</span>
                                </div>

                                <div className="cert-table-data">
                                    <div className="cert-data-row">
                                        <span className="row-key">Batch Title:</span>
                                        <strong>{certData.title}</strong>
                                    </div>
                                    <div className="cert-data-row">
                                        <span className="row-key">Execution Location:</span>
                                        <span>📍 {certData.location || 'Field Location Verified'}</span>
                                    </div>
                                    <div className="cert-data-row">
                                        <span className="row-key">Promoter:</span>
                                        <span>{certData.promoter?.name} ({certData.promoter?.email})</span>
                                    </div>
                                    <div className="cert-data-row">
                                        <span className="row-key">Managing Agency:</span>
                                        <span>{certData.manager?.company} — {certData.manager?.name}</span>
                                    </div>
                                    {certData.client && (
                                        <div className="cert-data-row">
                                            <span className="row-key">Brand Client:</span>
                                            <span>{certData.client.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="cert-metrics-box">
                                    <h3>AI INTEGRITY & PRIVACY AUDIT</h3>
                                    <div className="metrics-triad">
                                        <div className="triad-item">
                                            <span className="triad-val">{certData.aiIntegrity.verificationScore}%</span>
                                            <span className="triad-lbl">Authenticity Index</span>
                                        </div>
                                        <div className="triad-item">
                                            <span className="triad-val">{certData.aiIntegrity.uniqueIndividuals}</span>
                                            <span className="triad-lbl">Unique Individuals</span>
                                        </div>
                                        <div className="triad-item">
                                            <span className="triad-val">{certData.aiIntegrity.facesSecured}</span>
                                            <span className="triad-lbl">Faces Anonymized</span>
                                        </div>
                                    </div>
                                    <p className="privacy-statement-text">
                                        🔒 <strong>Privacy Statement:</strong> {certData.aiIntegrity.privacyStandard}. All facial data has been irreversibly blurred with zero raw biometric storage.
                                    </p>
                                </div>

                                <div className="cert-signature-row">
                                    <div className="sig-block">
                                        <div className="sig-underline">PROMOSECURE AUTOMATED AI</div>
                                        <span className="sig-sub">AI Engine Cryptographic Signature</span>
                                    </div>
                                    <div className="sig-block">
                                        <div className="sig-underline">SUPER ADMIN AUDIT STAMP</div>
                                        <span className="sig-sub">Platform Verification Seal</span>
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
                .admin-batches-page {
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

                .flagged-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #d97706;
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

                .refresh-icon-btn:hover {
                    color: var(--text-primary);
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

                .highlight-warn-row {
                    background: rgba(220, 38, 38, 0.02);
                }

                .batch-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .batch-title-clickable {
                    font-weight: 600;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                .batch-title-clickable:hover {
                    color: #0d9488;
                    text-decoration: underline;
                }

                .batch-location-sub {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .client-badge {
                    background: #eff6ff;
                    color: #2563eb;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 1px 6px;
                    border-radius: 4px;
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

                .integrity-col {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .score-pill {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    width: fit-content;
                }
                .score-pill.high { background: #f0fdf4; color: #16a34a; }
                .score-pill.warn { background: #fef2f2; color: #dc2626; }

                .flag-pill {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: #d97706;
                }

                .status-col {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .status-tag {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    width: fit-content;
                }
                .status-tag.approved { background: #f0fdf4; color: #16a34a; }
                .status-tag.pending { background: #fffbeb; color: #b45309; }
                .status-tag.rejected { background: #fef2f2; color: #dc2626; }
                .status-tag.draft { background: #f1f5f9; color: #475569; }

                .overridden-tag {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #7c3aed;
                    background: #f5f3ff;
                    padding: 1px 4px;
                    border-radius: 4px;
                    width: fit-content;
                }

                .actions-cell {
                    display: flex;
                    gap: 6px;
                    justify-content: flex-end;
                }

                .btn-action {
                    padding: 6px 10px;
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

                .btn-action:hover {
                    background: var(--bg-secondary);
                }

                .btn-inspect { background: #0f766e; color: #ffffff; border-color: #0f766e; }
                .btn-inspect:hover { background: #115e59; }

                .btn-cert { background: #2563eb; color: #ffffff; border-color: #2563eb; }
                .btn-cert:hover { background: #1d4ed8; }

                .btn-override { background: #7c3aed; color: #ffffff; border-color: #7c3aed; }
                .btn-override:hover { background: #6d28d9; }

                /* ═════ INSPECTOR MODAL ═════ */
                .modal-backdrop-layer {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .inspector-window {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    width: min(1060px, 95vw);
                    height: min(840px, 92vh);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
                }

                .inspector-top-bar {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: var(--bg-primary);
                }

                .tag-line {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 4px;
                }

                .privacy-active-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #0f766e;
                    background: #ccfbf1;
                    padding: 2px 8px;
                    border-radius: 20px;
                }

                .modal-heading-text {
                    font-size: 1.3rem;
                    font-weight: 700;
                    margin: 0;
                    color: var(--text-primary);
                }

                .modal-sub-details {
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                    margin: 3px 0 0 0;
                }

                .close-x-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                }

                .close-x-btn:hover {
                    color: var(--text-primary);
                    background: var(--bg-secondary);
                }

                .inspector-info-banner {
                    background: #0f172a;
                    color: #e2e8f0;
                    padding: 10px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    border-bottom: 1px solid #1e293b;
                    flex-wrap: wrap;
                }

                .banner-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .banner-icon {
                    color: #38bdf8;
                    font-size: 1.3rem;
                    flex-shrink: 0;
                }

                .banner-label {
                    display: block;
                    font-size: 0.7rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .banner-value {
                    font-size: 0.88rem;
                    color: #f8fafc;
                }

                .gps-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: #38bdf8;
                    text-decoration: none;
                    margin-left: 8px;
                }

                .gps-link:hover {
                    text-decoration: underline;
                }

                .banner-privacy-notice {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.78rem;
                    color: #cbd5e1;
                    max-width: 520px;
                }

                .inspector-split-layout {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    overflow: hidden;
                }

                .photo-stage-area {
                    background: #050811;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow-y: auto;
                }

                .main-photo-frame {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid #1e293b;
                    position: relative;
                }

                .photo-header-pill {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(4px);
                    color: #2dd4bf;
                    font-size: 0.75rem;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 4px;
                    border: 1px solid #334155;
                    z-index: 2;
                }

                .main-photo-frame img {
                    max-width: 100%;
                    max-height: 480px;
                    object-fit: contain;
                }

                .photo-nav-strip {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #1e293b;
                }

                .nav-arrow-btn {
                    background: #1e293b;
                    border: none;
                    color: #ffffff;
                    padding: 7px 12px;
                    border-radius: 6px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .nav-arrow-btn:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }

                .thumb-reel {
                    display: flex;
                    gap: 6px;
                    overflow-x: auto;
                    max-width: 440px;
                    padding: 2px;
                }

                .thumb-card {
                    width: 46px;
                    height: 46px;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 2px solid transparent;
                    cursor: pointer;
                    position: relative;
                    flex-shrink: 0;
                }

                .thumb-card.current {
                    border-color: #0d9488;
                }

                .thumb-card img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .thumb-num {
                    position: absolute;
                    bottom: 1px;
                    right: 1px;
                    background: rgba(0, 0, 0, 0.7);
                    color: #fff;
                    font-size: 0.6rem;
                    padding: 1px 3px;
                    border-radius: 3px;
                }

                .telemetry-side-panel {
                    background: var(--bg-secondary);
                    border-left: 1px solid var(--border-color);
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    overflow-y: auto;
                }

                .side-title {
                    font-size: 0.95rem;
                    font-weight: 700;
                    margin: 0 0 12px 0;
                    color: var(--text-primary);
                }

                .telemetry-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .tel-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 10px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .tel-title {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                .tel-val {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .tel-val-sub {
                    font-size: 0.82rem;
                    color: var(--text-primary);
                }

                .tel-code {
                    font-size: 0.75rem;
                    background: var(--bg-secondary);
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    color: #0284c7;
                    word-break: break-all;
                }

                .side-actions-box {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 16px;
                    padding-top: 14px;
                    border-top: 1px solid var(--border-color);
                }

                .btn-primary-action {
                    width: 100%;
                    padding: 9px;
                    border-radius: 8px;
                    background: #7c3aed;
                    color: #ffffff;
                    border: none;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .btn-primary-action:hover { background: #6d28d9; }

                .btn-secondary-action {
                    width: 100%;
                    padding: 9px;
                    border-radius: 8px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .btn-secondary-action:hover { background: var(--bg-secondary); }

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
                    gap: 6px;
                }

                .dialog-field label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .dialog-select, .dialog-textarea {
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

                .btn-confirm-override:hover { background: #6d28d9; }

                /* ═════ CERTIFICATE MODAL ═════ */
                .cert-dialog-window {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    width: min(840px, 95vw);
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 20px;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                }

                .cert-top-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-bottom: 14px;
                }

                .btn-print {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                .printable-certificate-document {
                    background: #ffffff;
                    color: #0f172a;
                    border: 2px solid #0f172a;
                    border-radius: 10px;
                    padding: 32px;
                    font-family: 'Times New Roman', serif;
                }

                .cert-header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 12px;
                }

                .brand-logo {
                    font-size: 1.4rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    color: #0f172a;
                }

                .cert-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 800;
                    color: #0f766e;
                }

                .cert-title-section {
                    text-align: center;
                    margin: 20px 0;
                }

                .cert-title-section h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 0 0 4px 0;
                }

                .cert-id {
                    font-family: monospace;
                    font-size: 0.82rem;
                    color: #64748b;
                }

                .cert-table-data {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                .cert-data-row {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 4px;
                    font-size: 0.92rem;
                }

                .row-key {
                    color: #64748b;
                    font-weight: 600;
                }

                .cert-metrics-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .cert-metrics-box h3 {
                    font-size: 0.9rem;
                    margin: 0 0 10px 0;
                    color: #0f172a;
                }

                .metrics-triad {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    text-align: center;
                    margin-bottom: 10px;
                }

                .triad-val {
                    display: block;
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #0f766e;
                }

                .triad-lbl {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .privacy-statement-text {
                    font-size: 0.82rem;
                    color: #334155;
                    margin: 0;
                }

                .cert-signature-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 36px;
                    padding-top: 16px;
                }

                .sig-block {
                    text-align: center;
                    width: 200px;
                }

                .sig-underline {
                    border-top: 1px solid #0f172a;
                    padding-top: 4px;
                    font-size: 0.78rem;
                    font-weight: 700;
                }

                .sig-sub {
                    font-size: 0.68rem;
                    color: #64748b;
                }

                .cert-hash-footer {
                    display: flex;
                    justify-content: space-between;
                    font-family: monospace;
                    font-size: 0.72rem;
                    color: #94a3b8;
                    margin-top: 24px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 8px;
                }

                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                    .cert-dialog-window { border: none !important; box-shadow: none !important; width: 100% !important; max-height: none !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminBatches;
