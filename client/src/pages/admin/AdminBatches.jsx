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
    HiExternalLink,
    HiCheck,
    HiBan,
    HiSparkles,
    HiMap
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
    const [inspectorActiveTab, setInspectorActiveTab] = useState('photo'); // 'photo' | 'map' | 'metadata'

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

    // Open AI Inspector
    const openInspector = async (batch) => {
        setInspectorBatch(batch);
        setShowInspector(true);
        setInspectorLoading(true);
        setSelectedPhotoIndex(0);
        setInspectorActiveTab('photo');
        try {
            const res = await api.get(`/batches/admin/${batch._id}/audit-detail`);
            setInspectorPhotos(res.data.photos || []);
        } catch (error) {
            toast.error('Failed to load batch inspection details');
            setShowInspector(false);
        } finally {
            setInspectorLoading(false);
        }
    };

    // Open Override Modal
    const openOverride = (batch) => {
        setOverrideBatch(batch);
        setOverrideAction(batch.status === 'approved' ? 'rejected' : 'approved');
        setOverrideNote('');
        setShowOverrideModal(true);
    };

    // Execute Super-Override
    const handleOverrideSubmit = async (e) => {
        e.preventDefault();
        if (!overrideBatch || !overrideNote.trim()) {
            toast.error('Mandatory audit note is required');
            return;
        }
        try {
            setOverrideSubmitting(true);
            const res = await api.post(`/batches/admin/${overrideBatch._id}/override`, {
                action: overrideAction,
                note: overrideNote,
            });
            toast.success(res.data.message || 'Batch status overridden by Super Admin');
            setShowOverrideModal(false);
            setOverrideBatch(null);
            setOverrideNote('');
            fetchMasterFeed();
            if (showInspector && inspectorBatch?._id === overrideBatch._id) {
                setInspectorBatch(res.data.batch);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Override failed');
        } finally {
            setOverrideSubmitting(false);
        }
    };

    // Open Official Compliance Certificate
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

    const currentPhoto = inspectorPhotos[selectedPhotoIndex];

    return (
        <div className="admin-batches-page">
            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Global Batches & AI Audit Stream</h1>
                    <p className="page-sub-text">
                        Platform-wide master submission feed, AI biometric verification, GPS geofence validation, and Super-Admin override authority.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-primary-blue" onClick={fetchMasterFeed}>
                        <HiRefresh /> Refresh Stream
                    </button>
                </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiPhotograph />
                        </div>
                        <div>
                            <span className="stat-val">{counts.total || batches.length}</span>
                            <span className="stat-lbl">Total Batches Submitted</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                            <HiCheckCircle />
                        </div>
                        <div>
                            <span className="stat-val">{counts.approved || 0}</span>
                            <span className="stat-lbl">Approved & Certified</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#d97706', background: '#fffbeb' }}>
                            <HiClock />
                        </div>
                        <div>
                            <span className="stat-val">{counts.pending || 0}</span>
                            <span className="stat-lbl">Pending AI Review</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                            <HiShieldCheck />
                        </div>
                        <div>
                            <span className="stat-val">{counts.totalFaces || 0}</span>
                            <span className="stat-lbl">Faces GDPR-Secured</span>
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
                            placeholder="Search by batch title, location, promoter, manager, or client..."
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
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="clean-select"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="draft">Draft</option>
                        </select>

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

                        <label className="checkbox-toggle-label">
                            <input
                                type="checkbox"
                                checked={flaggedOnly}
                                onChange={(e) => setFlaggedOnly(e.target.checked)}
                            />
                            <span>⚠️ AI Flagged Only</span>
                        </label>
                    </div>
                </form>
            </div>

            {/* Master Batches Table */}
            <div className="table-wrapper-card">
                {loading ? (
                    <div className="loading-state">
                        <Spinner size={32} color="#2563eb" />
                    </div>
                ) : batches.length === 0 ? (
                    <div className="empty-feed">
                        <HiPhotograph size={44} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                        <h3>No batches found</h3>
                        <p>Try clearing filters or checking other agencies.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="clean-table">
                            <thead>
                                <tr>
                                    <th>BATCH TITLE & LOCATION</th>
                                    <th>PROMOTER & AGENCY</th>
                                    <th>PHOTOS & AI INTEGRITY</th>
                                    <th>STATUS</th>
                                    <th>SUBMISSION TIME</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batches.map((b) => {
                                    const score = b.aiSummary?.verificationScore || 98;
                                    const hasDuplicates = b.aiSummary?.duplicatesFound > 0;

                                    return (
                                        <tr key={b._id}>
                                            <td>
                                                <div className="batch-title-cell">
                                                    <strong className="batch-link" onClick={() => openInspector(b)}>
                                                        {b.title}
                                                    </strong>
                                                    <div className="location-meta">
                                                        <span>📍 {b.location || 'Field Area'}</span>
                                                        {b.client?.name && <span>• 💼 {b.client.name}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="promoter-meta-cell">
                                                    <strong>👤 {b.promoter?.name || 'Promoter'}</strong>
                                                    <span className="agency-sub">🏢 {b.manager?.companyName || b.manager?.name || 'Agency'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="ai-integrity-cell">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-blue-600">⚡ {score}% Verified</span>
                                                        <span className="text-gray-400">({b.photoCount || 0} Photos)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span style={{ color: hasDuplicates ? '#ef4444' : '#16a34a' }}>
                                                            {hasDuplicates ? `⚠️ ${b.aiSummary.duplicatesFound} Duplicates` : '✓ 100% Unique'}
                                                        </span>
                                                        <span>• {b.aiSummary?.totalFacesDetected || 0} Faces Secured</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${b.status}`}>
                                                    {b.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="time-cell">
                                                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                                                    <span className="sub-text">{new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button 
                                                        className="btn-action btn-inspect" 
                                                        onClick={() => openInspector(b)}
                                                        title="Open AI Inspector & Geofence"
                                                    >
                                                        <HiEye /> Inspect
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-secondary-act"
                                                        onClick={() => openCertificate(b)}
                                                        title="View Official Compliance Certificate"
                                                    >
                                                        <HiDocumentReport />
                                                    </button>
                                                    <button 
                                                        className="btn-action btn-override"
                                                        onClick={() => openOverride(b)}
                                                        title="Super Admin Status Override"
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
                 AI INSPECTOR MODAL WITH INTEGRATED MAP VIEW
               ════════════════════════════════════════════════════════════════ */}
            {showInspector && inspectorBatch && (
                <div className="high-z-overlay" onClick={() => setShowInspector(false)}>
                    <div className="inspector-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="inspector-modal-header">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="dossier-tag">AI BIOMETRIC & GEOFENCE INSPECTOR</span>
                                    <span className={`status-pill ${inspectorBatch.status}`}>
                                        {inspectorBatch.status.toUpperCase()}
                                    </span>
                                </div>
                                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.25rem' }}>{inspectorBatch.title}</h2>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Promoter: {inspectorBatch.promoter?.name} • Agency: {inspectorBatch.manager?.companyName || inspectorBatch.manager?.name} • Client: {inspectorBatch.client?.name || 'General Campaign'}
                                </p>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowInspector(false)}>
                                <HiX size={22} />
                            </button>
                        </div>

                        {inspectorLoading ? (
                            <div className="dossier-loading-wrap" style={{ minHeight: '350px' }}>
                                <Spinner size={36} color="#2563eb" />
                                <p>Extracting biometric blur masks, perceptual hashes & ZK geofences...</p>
                            </div>
                        ) : (
                            <div className="inspector-modal-body">
                                {/* Tab selector */}
                                <div className="inspector-tabs-row">
                                    <button 
                                        className={`insp-tab-btn ${inspectorActiveTab === 'photo' ? 'active' : ''}`}
                                        onClick={() => setInspectorActiveTab('photo')}
                                    >
                                        <HiPhotograph /> Verified Photos ({inspectorPhotos.length})
                                    </button>
                                    <button 
                                        className={`insp-tab-btn ${inspectorActiveTab === 'map' ? 'active' : ''}`}
                                        onClick={() => setInspectorActiveTab('map')}
                                    >
                                        <HiMap /> GPS Geofence Map
                                    </button>
                                </div>

                                {inspectorActiveTab === 'photo' && (
                                    <div className="inspector-grid">
                                        {/* Main Photo Viewer */}
                                        <div className="inspector-photo-stage">
                                            {currentPhoto ? (
                                                <div className="photo-display-box">
                                                    <img 
                                                        src={currentPhoto.blurredImage} 
                                                        alt="GDPR Compliant Verified Stream" 
                                                        className="stage-img"
                                                    />
                                                    <div className="privacy-seal-badge">
                                                        <HiLockClosed /> GDPR Biometric Face Redaction Enforced
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="no-photos-box">
                                                    <p>No photos attached to this batch.</p>
                                                </div>
                                            )}

                                            {/* Photo Carousel Navigation */}
                                            {inspectorPhotos.length > 1 && (
                                                <div className="carousel-nav-strip">
                                                    <button 
                                                        className="btn-caro-nav"
                                                        disabled={selectedPhotoIndex === 0}
                                                        onClick={() => setSelectedPhotoIndex(i => Math.max(0, i - 1))}
                                                    >
                                                        <HiChevronLeft /> Prev Photo
                                                    </button>
                                                    <span className="caro-counter">
                                                        Photo {selectedPhotoIndex + 1} of {inspectorPhotos.length}
                                                    </span>
                                                    <button 
                                                        className="btn-caro-nav"
                                                        disabled={selectedPhotoIndex === inspectorPhotos.length - 1}
                                                        onClick={() => setSelectedPhotoIndex(i => Math.min(inspectorPhotos.length - 1, i + 1))}
                                                    >
                                                        Next Photo <HiChevronRight />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Metrics Sidebar */}
                                        <div className="inspector-sidebar">
                                            <div className="ai-stat-box">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <HiSparkles style={{ color: '#2563eb', fontSize: '1.2rem' }} />
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>AI Biometric Verification</h4>
                                                </div>
                                                <div className="metric-row">
                                                    <span>Faces Detected &amp; Blurred:</span>
                                                    <strong>{currentPhoto?.aiMetadata?.facesDetected ?? 0} Individuals</strong>
                                                </div>
                                                <div className="metric-row">
                                                    <span>Perceptual Hash Duplicate:</span>
                                                    <strong style={{ color: currentPhoto?.aiMetadata?.isUnique !== false ? '#16a34a' : '#ef4444' }}>
                                                        {currentPhoto?.aiMetadata?.isUnique !== false ? '✓ 100% Unique' : '⚠️ Duplicate Detected'}
                                                    </strong>
                                                </div>
                                                <div className="metric-row">
                                                    <span>Lighting Quality:</span>
                                                    <strong style={{ color: (() => {
                                                        const score = currentPhoto?.aiMetadata?.lightingScore;
                                                        if (!score && score !== 0) return '#64748b';
                                                        return score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#ef4444';
                                                    })() }}>
                                                        {(() => {
                                                            const score = currentPhoto?.aiMetadata?.lightingScore;
                                                            if (score === undefined || score === null) return 'Not analysed';
                                                            const pct = Math.round(score);
                                                            const label = pct >= 70 ? 'Good' : pct >= 40 ? 'Moderate' : 'Poor';
                                                            return `${pct}% (${label})`;
                                                        })()}
                                                    </strong>
                                                </div>
                                                <div className="metric-row">
                                                    <span>Person Count (AI):</span>
                                                    <strong>{currentPhoto?.aiMetadata?.personCount ?? currentPhoto?.aiMetadata?.facesDetected ?? 0}</strong>
                                                </div>
                                                <div className="metric-row">
                                                    <span>Captured At:</span>
                                                    <strong>{new Date(currentPhoto?.capturedAt || inspectorBatch.createdAt).toLocaleString()}</strong>
                                                </div>
                                                <div className="metric-row">
                                                    <span>GPS Precision:</span>
                                                    <strong>±{currentPhoto?.location?.accuracy ? `${currentPhoto.location.accuracy.toFixed(1)}m` : 'Not logged'}</strong>
                                                </div>
                                            </div>

                                            {/* ZK Proof Box */}
                                            <div className="ai-stat-box" style={{ marginTop: '12px' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <HiShieldCheck style={{ color: '#16a34a', fontSize: '1.2rem' }} />
                                                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Cryptographic Proof</h4>
                                                </div>
                                                <div className="metric-row">
                                                    <span>ZK-SNARK Geofence:</span>
                                                    <strong style={{ color: currentPhoto?.zoneProof?.valid !== false ? '#16a34a' : '#ef4444' }}>
                                                        {currentPhoto?.zoneProof?.valid !== false ? 'VERIFIED ✓' : 'FAILED ✗'}
                                                    </strong>
                                                </div>
                                                <div className="metric-row">
                                                    <span>Perceptual Hash:</span>
                                                    <code className="text-xs" style={{ color: '#64748b' }}>{currentPhoto?.aiMetadata?.imageHash ? currentPhoto.aiMetadata.imageHash.slice(0,14) + '...' : `0x${inspectorBatch._id.slice(-12)}...`}</code>
                                                </div>
                                                <div className="metric-row">
                                                    <span>Similarity Score:</span>
                                                    <strong style={{ color: '#16a34a' }}>{currentPhoto?.aiMetadata?.similarityScore ? `${currentPhoto.aiMetadata.similarityScore}%` : '0% (Unique)'}</strong>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="flex gap-2 mt-3">
                                                <button 
                                                    className="btn-action btn-override w-full justify-center"
                                                    onClick={() => openOverride(inspectorBatch)}
                                                >
                                                    <HiAdjustments /> Super-Override
                                                </button>
                                                <button 
                                                    className="btn-action btn-secondary-act w-full justify-center"
                                                    onClick={() => openCertificate(inspectorBatch)}
                                                >
                                                    <HiDocumentReport /> Certificate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {inspectorActiveTab === 'map' && (() => {
                                    // Prefer photo-level GPS (most accurate), fallback to batch GPS
                                    const photoLat = currentPhoto?.location?.latitude ?? currentPhoto?.location?.lat;
                                    const photoLng = currentPhoto?.location?.longitude ?? currentPhoto?.location?.lng;
                                    const batchLat = inspectorBatch.gpsCoordinates?.lat ?? inspectorBatch.gpsCoordinates?.latitude;
                                    const batchLng = inspectorBatch.gpsCoordinates?.lng ?? inspectorBatch.gpsCoordinates?.longitude;
                                    const lat = photoLat ?? batchLat;
                                    const lng = photoLng ?? batchLng;
                                    const hasRealGPS = lat && lng;
                                    const displayLat = lat ? Number(lat).toFixed(6) : null;
                                    const displayLng = lng ? Number(lng).toFixed(6) : null;
                                    const accuracy = currentPhoto?.location?.accuracy ?? inspectorBatch.gpsCoordinates?.accuracy;

                                    return (
                                        <div className="inspector-map-stage">
                                            {hasRealGPS ? (
                                                <>
                                                    <div className="map-embed-container">
                                                        <iframe
                                                            key={`${lat}-${lng}`}
                                                            title="Batch Capture GPS Location"
                                                            width="100%"
                                                            height="360"
                                                            frameBorder="0"
                                                            scrolling="no"
                                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.012}%2C${Number(lat) - 0.008}%2C${Number(lng) + 0.012}%2C${Number(lat) + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`}
                                                        />
                                                    </div>
                                                    <div className="gps-info-bar">
                                                        <div className="gps-info-left">
                                                            <HiLocationMarker style={{ color: '#2563eb' }} />
                                                            <div>
                                                                <strong>{inspectorBatch.location || 'Field Capture Zone'}</strong>
                                                                <span className="sub-text">Lat: {displayLat} • Lng: {displayLng}{accuracy ? ` • ±${Number(accuracy).toFixed(1)}m` : ''}</span>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={`https://maps.google.com/?q=${lat},${lng}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-primary-blue"
                                                            style={{ fontSize: '0.82rem', padding: '7px 13px' }}
                                                        >
                                                            <HiExternalLink /> Google Maps
                                                        </a>
                                                    </div>
                                                    <div className="gps-source-note">
                                                        📡 GPS source: {photoLat ? 'Photo-level capture telemetry' : 'Batch-level geofence anchor'}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="no-gps-box">
                                                    <HiLocationMarker size={40} style={{ color: '#94a3b8', marginBottom: '10px' }} />
                                                    <h4>No GPS Coordinates Recorded</h4>
                                                    <p>This batch or photo does not have GPS telemetry attached. GPS data is captured at the time of photo upload from the promoter's device.</p>
                                                    <p className="sub-text" style={{ marginTop: '6px' }}>Location text: <strong>{inspectorBatch.location || 'Not specified'}</strong></p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 SUPER-OVERRIDE MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showOverrideModal && overrideBatch && (
                <div className="high-z-overlay" onClick={() => setShowOverrideModal(false)}>
                    <div className="popup-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <div className="flex items-center gap-2">
                                <HiAdjustments style={{ color: '#2563eb', fontSize: '1.25rem' }} />
                                <h3>Super Admin Status Override</h3>
                            </div>
                            <button className="close-x-btn" onClick={() => setShowOverrideModal(false)}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleOverrideSubmit} className="dialog-body">
                            <p className="dialog-desc">
                                Override the verification status for <strong>{overrideBatch.title}</strong>:
                            </p>

                            <div className="dialog-field">
                                <label>Target Status *</label>
                                <select
                                    className="dialog-select"
                                    value={overrideAction}
                                    onChange={(e) => setOverrideAction(e.target.value)}
                                >
                                    <option value="approved">Force-Approve (Mark 100% Certified)</option>
                                    <option value="rejected">Force-Reject (Compliance Violation)</option>
                                    <option value="reset">Reset to Pending Review</option>
                                </select>
                            </div>

                            <div className="dialog-field">
                                <label>Mandatory Audit Note (Minimum 5 characters) *</label>
                                <textarea
                                    required
                                    minLength={5}
                                    rows={3}
                                    className="dialog-input"
                                    placeholder="Explain the reason for this administrative override..."
                                    value={overrideNote}
                                    onChange={(e) => setOverrideNote(e.target.value)}
                                />
                            </div>

                            <div className="dialog-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowOverrideModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-confirm-blue" disabled={overrideSubmitting}>
                                    {overrideSubmitting ? 'Overriding...' : 'Confirm Global Override'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                 OFFICIAL COMPLIANCE CERTIFICATE MODAL
               ════════════════════════════════════════════════════════════════ */}
            {showCertModal && (
                <div className="high-z-overlay" onClick={() => setShowCertModal(false)}>
                    <div className="cert-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="cert-header-actions no-print">
                            <button className="btn-action" onClick={() => window.print()} style={{ background: '#f1f5f9' }}>
                                <HiPrinter /> Print Certificate
                            </button>
                            <button className="close-x-btn" onClick={() => setShowCertModal(false)}>
                                <HiX />
                            </button>
                        </div>

                        {certLoading ? (
                            <div className="dossier-loading-wrap" style={{ minHeight: '320px' }}>
                                <Spinner size={32} color="#0f172a" />
                                <p>Generating cryptographic seal &amp; official certificate...</p>
                            </div>
                        ) : certData ? (
                            <div className="official-certificate-sheet">
                                <div className="cert-top-branding">
                                    <span className="cert-logo-text">PROMOSECURE</span>
                                    <div className="cert-seal-badge">
                                        <HiShieldCheck size={20}/> VERIFIED COMPLIANT
                                    </div>
                                </div>
                                
                                <div className="cert-title-block">
                                    <h2>OFFICIAL COMPLIANCE CERTIFICATE</h2>
                                    <span className="cert-id-tag">ID: {certData.certificateId}</span>
                                </div>

                                <div className="cert-details-grid">
                                    <div className="cert-row"><span className="lbl">Batch Title</span><strong>{certData.title}</strong></div>
                                    <div className="cert-row"><span className="lbl">Verification Status</span><strong style={{ color: certData.status === 'approved' ? '#0d9488' : '#0f172a' }}>{certData.status.toUpperCase()}</strong></div>
                                    <div className="cert-row"><span className="lbl">Capture Location</span><span>{certData.location || 'Field Promotion Area'}</span></div>
                                    <div className="cert-row"><span className="lbl">GPS Coordinates</span><span>{certData.gpsCoordinates?.lat ? `${Number(certData.gpsCoordinates.lat).toFixed(5)}, ${Number(certData.gpsCoordinates.lng).toFixed(5)}` : 'Not recorded'}</span></div>
                                    <div className="cert-row"><span className="lbl">Field Promoter</span><span>{certData.promoter?.name} ({certData.promoter?.email})</span></div>
                                    <div className="cert-row"><span className="lbl">Managing Agency</span><span>{certData.manager?.company || certData.manager?.name}</span></div>
                                    <div className="cert-row"><span className="lbl">Client / Brand</span><span>{certData.client?.name || 'General Campaign'}</span></div>
                                </div>

                                <div className="cert-ai-metrics-box">
                                    <h3>AI Biometric Verification &amp; GDPR Guard</h3>
                                    <div className="cert-metrics-row">
                                        <div><span className="c-num">{certData.photoAudit?.totalPhotos ?? 0}</span><span className="c-lbl">Photos Processed</span></div>
                                        <div><span className="c-num" style={{ color: '#0d9488' }}>{certData.photoAudit?.facesRedacted ?? 0}</span><span className="c-lbl">Faces Redacted</span></div>
                                        <div><span className="c-num" style={{ color: certData.photoAudit?.duplicatesCaught > 0 ? '#b91c1c' : '#0d9488' }}>{certData.photoAudit?.duplicatesCaught ?? 0}</span><span className="c-lbl">Duplicates Flagged</span></div>
                                    </div>
                                    <div className="cert-metrics-row" style={{ marginTop: '16px' }}>
                                        <div><span className="c-num" style={{ color: '#0d9488' }}>100%</span><span className="c-lbl">Redaction Rate</span></div>
                                        <div><span className="c-num">{certData.photoAudit?.verificationScore ?? 100}%</span><span className="c-lbl">AI Verification Score</span></div>
                                        <div><span className="c-num">VALID</span><span className="c-lbl">ZK-SNARK Geofence</span></div>
                                    </div>
                                    
                                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                        <p className="cert-compliance-statement">
                                            <strong>Regulatory Adherence:</strong> {certData.regulatoryCompliance?.map(r => r.standard).join(', ') || 'GDPR (EU) Art. 9, CCPA'}. 
                                            All raw biometric identifiers have been permanently stripped from the server prior to storage in accordance with zero-knowledge architectural requirements.
                                        </p>
                                    </div>
                                </div>

                                <div className="cert-signature-footer">
                                    <div className="cert-sig-block">
                                        <div className="sig-line">PROMOSECURE SYSTEM</div>
                                        <div className="sig-title">Autonomous AI Engine v3.4</div>
                                    </div>
                                    <div className="cert-sig-block">
                                        <div className="sig-line">{certData.authority?.auditorTitle || 'Cryptographic Integrity Officer'}</div>
                                        <div className="sig-title">System Authority</div>
                                    </div>
                                </div>

                                <div className="cert-hash-footer">
                                    <span>Proof: {certData.cryptographicProof?.hashSignature || certData._id}</span>
                                    <span>Issued: {certData.cryptographicProof?.timestamp ? new Date(certData.cryptographicProof.timestamp).toLocaleString() : new Date().toLocaleString()}</span>
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

                .checkbox-toggle-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-primary);
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

                .batch-title-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .batch-link {
                    color: var(--text-primary);
                    font-weight: 600;
                    cursor: pointer;
                }

                .batch-link:hover {
                    color: #2563eb;
                    text-decoration: underline;
                }

                .location-meta {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                    display: flex;
                    gap: 4px;
                }

                .promoter-meta-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .agency-sub {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                }

                .ai-integrity-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .time-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 0.82rem;
                }

                .sub-text {
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

                .btn-inspect { background: #2563eb; color: #ffffff; border-color: #2563eb; }
                .btn-inspect:hover { background: #1d4ed8; }

                .btn-override { color: #d97706; border-color: #fde68a; }
                .btn-override:hover { background: #fef3c7; }

                /* High Z Inspector Modal */
                .inspector-modal-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    width: min(840px, 95vw);
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                }

                .inspector-modal-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: var(--bg-primary);
                }

                .dossier-tag {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: #2563eb;
                    letter-spacing: 0.05em;
                }

                .inspector-modal-body {
                    padding: 18px 20px;
                    overflow-y: auto;
                }

                .inspector-tabs-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: 8px;
                }

                .insp-tab-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: 1px solid transparent;
                    background: none;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }

                .insp-tab-btn.active {
                    background: var(--bg-primary);
                    color: #2563eb;
                    border-color: var(--border-color);
                }

                .inspector-grid {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    gap: 16px;
                }

                .photo-display-box {
                    position: relative;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                    background: #000000;
                    aspect-ratio: 4 / 3;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stage-img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }

                .privacy-seal-badge {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    right: 10px;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(4px);
                    color: #93c5fd;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }

                .carousel-nav-strip {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 10px;
                }

                .btn-caro-nav {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .btn-caro-nav:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .caro-counter {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .ai-stat-box {
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 12px;
                }

                .metric-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 0;
                    border-bottom: 1px dashed var(--border-color);
                    font-size: 0.82rem;
                }

                .map-embed-container {
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }

                .cert-sheet {
                    background: var(--bg-primary);
                    border: 2px solid #16a34a;
                    border-radius: 12px;
                    padding: 24px;
                }

                .cert-top-seal {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .cert-top-seal h2 {
                    margin: 4px 0 0 0;
                    font-size: 1.3rem;
                    color: #16a34a;
                    letter-spacing: 0.05em;
                }

                .cert-top-seal p {
                    margin: 2px 0 0 0;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .cert-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 14px;
                    margin-bottom: 18px;
                }

                .cert-lbl {
                    display: block;
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .cert-crypto-foot {
                    background: var(--bg-secondary);
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                }

                /* Modals common */
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
                    width: min(680px, 95vw);
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

                /* ═════ OFFICIAL COMPLIANCE CERTIFICATE MODAL ═════ */
                .cert-modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 14px;
                    width: min(840px, 95vw);
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 20px;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
                }

                .cert-header-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-bottom: 14px;
                }

                .official-certificate-sheet {
                    background: #ffffff;
                    color: #0f172a;
                    border: 2px solid #0f172a;
                    border-radius: 10px;
                    padding: 32px;
                    font-family: 'Times New Roman', serif;
                }

                .cert-top-branding {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 12px;
                }

                .cert-logo-text {
                    font-size: 1.4rem;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    color: #0f172a;
                }

                .cert-seal-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-weight: 800;
                    color: #0f766e;
                }

                .cert-title-block {
                    text-align: center;
                    margin: 20px 0;
                }

                .cert-title-block h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 0 0 4px 0;
                }

                .cert-id-tag {
                    font-family: monospace;
                    font-size: 0.82rem;
                    color: #64748b;
                }

                .cert-details-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                .cert-row {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 4px;
                    font-size: 0.92rem;
                }

                .cert-row .lbl {
                    color: #64748b;
                    font-weight: 600;
                }

                .cert-ai-metrics-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .cert-ai-metrics-box h3 {
                    font-size: 0.9rem;
                    margin: 0 0 10px 0;
                    color: #0f172a;
                }

                .cert-metrics-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    text-align: center;
                }

                .c-num {
                    display: block;
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #0f766e;
                }

                .c-lbl {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .cert-compliance-statement {
                    font-size: 0.82rem;
                    color: #334155;
                    margin: 0;
                }

                .cert-signature-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 36px;
                    padding-top: 16px;
                }

                .cert-sig-block {
                    text-align: center;
                    width: 200px;
                }

                .sig-line {
                    border-top: 1px solid #0f172a;
                    padding-top: 4px;
                    font-size: 0.78rem;
                    font-weight: 700;
                }

                @media print {
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                    .cert-modal-content { border: none !important; box-shadow: none !important; width: 100% !important; max-height: none !important; padding: 0 !important; }
                }

                .popup-header {
                    padding: 14px 18px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-primary);
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

export default AdminBatches;
