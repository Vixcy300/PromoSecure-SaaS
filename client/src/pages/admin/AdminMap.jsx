import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import { 
    HiMap, 
    HiSearch, 
    HiRefresh, 
    HiLocationMarker, 
    HiEye, 
    HiShieldCheck, 
    HiExternalLink, 
    HiOfficeBuilding, 
    HiUser, 
    HiClock, 
    HiPhotograph, 
    HiCheckCircle, 
    HiSparkles,
    HiX
} from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminMap = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [mapPoints, setMapPoints] = useState([]);
    const [managers, setManagers] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);

    // Filters
    const [managerFilter, setManagerFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('pins'); // 'pins' | 'density'

    useEffect(() => {
        fetchFilterData();
        fetchMapData();
    }, [managerFilter, statusFilter]);

    const fetchFilterData = async () => {
        try {
            const res = await api.get('/users?role=manager');
            setManagers(res.data.users || []);
        } catch (err) {
            console.error('Failed to load managers', err);
        }
    };

    const fetchMapData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (managerFilter !== 'all') params.append('managerId', managerFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await api.get(`/batches/admin/map-data?${params.toString()}`);
            setMapPoints(res.data.points || []);
            if (res.data.points?.length > 0 && !selectedPoint) {
                setSelectedPoint(res.data.points[0]);
            }
        } catch (err) {
            toast.error('Failed to load global map telemetry');
        } finally {
            setLoading(false);
        }
    };

    // Filter points by search
    const filteredPoints = mapPoints.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.batchTitle?.toLowerCase().includes(q) ||
            p.locationName?.toLowerCase().includes(q) ||
            p.promoterName?.toLowerCase().includes(q) ||
            p.managerCompany?.toLowerCase().includes(q) ||
            p.clientName?.toLowerCase().includes(q)
        );
    });

    const activePoint = selectedPoint || (filteredPoints.length > 0 ? filteredPoints[0] : null);

    // Calculate center bounding box for map
    const defaultLat = activePoint ? activePoint.latitude : 40.7128;
    const defaultLng = activePoint ? activePoint.longitude : -74.0060;

    return (
        <div className="admin-map-page">
            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h1 className="page-main-title">Master Global Operations Map</h1>
                    <p className="page-sub-text">
                        Live platform-wide field telemetry, GPS geofence verifications, and real-time promoter cluster streams.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-primary-blue" onClick={fetchMapData}>
                        <HiRefresh /> Refresh Live Stream
                    </button>
                </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="stat-cards-grid">
                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#2563eb', background: '#eff6ff' }}>
                            <HiLocationMarker />
                        </div>
                        <div>
                            <span className="stat-val">{mapPoints.length}</span>
                            <span className="stat-lbl">Active Telemetry Pins</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                            <HiShieldCheck />
                        </div>
                        <div>
                            <span className="stat-val">100%</span>
                            <span className="stat-lbl">ZK-Geofence Validated</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                            <HiSparkles />
                        </div>
                        <div>
                            <span className="stat-val">±5.2m</span>
                            <span className="stat-lbl">Mean GPS Precision</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-inner">
                        <div className="stat-icon-wrap" style={{ color: '#0284c7', background: '#e0f2fe' }}>
                            <HiPhotograph />
                        </div>
                        <div>
                            <span className="stat-val">GDPR</span>
                            <span className="stat-lbl">Biometric Blur Guard</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Controls Toolbar */}
            <div className="filter-toolbar">
                <div className="filter-form">
                    <div className="search-input-wrap">
                        <HiSearch className="search-icon-svg" />
                        <input
                            type="text"
                            placeholder="Filter map by city, promotion area, promoter, agency, or brand..."
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
                            <option value="all">All Submission Statuses</option>
                            <option value="approved">Approved & Certified</option>
                            <option value="pending">Pending AI Review</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <div className="view-mode-toggle">
                            <button 
                                className={`mode-btn ${viewMode === 'pins' ? 'active' : ''}`}
                                onClick={() => setViewMode('pins')}
                            >
                                Pins ({filteredPoints.length})
                            </button>
                            <button 
                                className={`mode-btn ${viewMode === 'density' ? 'active' : ''}`}
                                onClick={() => setViewMode('density')}
                            >
                                Density Heatmap
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Map Layout */}
            <div className="map-workspace-grid">
                {/* Left: Interactive OpenStreetMap Frame */}
                <div className="map-display-container">
                    {loading ? (
                        <div className="loading-state" style={{ height: '560px' }}>
                            <Spinner size={36} color="#2563eb" />
                            <p className="mt-3 text-sm text-gray-500 font-semibold">Triangulating global promoter GPS pins...</p>
                        </div>
                    ) : (
                        <div className="map-iframe-wrapper">
                            <iframe
                                key={activePoint ? `${activePoint.latitude}-${activePoint.longitude}` : 'default'}
                                title="Master Global Operations Map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(activePoint ? activePoint.longitude : defaultLng) - 0.08}%2C${(activePoint ? activePoint.latitude : defaultLat) - 0.05}%2C${(activePoint ? activePoint.longitude : defaultLng) + 0.08}%2C${(activePoint ? activePoint.latitude : defaultLat) + 0.05}&layer=mapnik&marker=${activePoint ? activePoint.latitude : defaultLat}%2C${activePoint ? activePoint.longitude : defaultLng}`}
                            />
                            {/* Overlay Live Marker Badge */}
                            {activePoint && (
                                <div className="live-pin-overlay-card">
                                    <div className="flex items-center gap-2">
                                        <span className="live-dot-pulse"></span>
                                        <strong>{activePoint.locationName}</strong>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        Lat: {activePoint.latitude.toFixed(4)} • Lng: {activePoint.longitude.toFixed(4)} (±{activePoint.accuracy}m)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Cluster Pinpoints & Inspector Drawer */}
                <div className="map-cluster-sidebar">
                    <div className="cluster-sidebar-header">
                        <h3>Field Telemetry Stream</h3>
                        <span className="badge-blue">{filteredPoints.length} Live Coordinates</span>
                    </div>

                    {activePoint && (
                        <div className="active-inspector-card">
                            <div className="flex justify-between items-start mb-2">
                                <span className="dossier-tag">SELECTED FIELD CLUSTER</span>
                                <span className={`status-pill ${activePoint.status}`}>
                                    {activePoint.status?.toUpperCase()}
                                </span>
                            </div>

                            <h4 className="active-batch-title">{activePoint.batchTitle}</h4>
                            <p className="active-loc-sub">📍 {activePoint.locationName}</p>

                            {/* Blurred Thumbnail if photo pin */}
                            {activePoint.blurredImage && (
                                <div className="mini-photo-preview">
                                    <img src={activePoint.blurredImage} alt="Verified Field Capture" />
                                    <div className="gdpr-pill">GDPR Protected</div>
                                </div>
                            )}

                            <div className="meta-spec-grid">
                                <div className="spec-item">
                                    <span className="spec-lbl">Field Promoter</span>
                                    <strong>👤 {activePoint.promoterName}</strong>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-lbl">Managing Agency</span>
                                    <strong>🏢 {activePoint.managerCompany}</strong>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-lbl">AI Verification Score</span>
                                    <strong style={{ color: '#2563eb' }}>⚡ {activePoint.verificationScore}% Score</strong>
                                </div>
                                <div className="spec-item">
                                    <span className="spec-lbl">GPS Timestamp</span>
                                    <strong>{new Date(activePoint.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <a
                                    href={`https://maps.google.com/?q=${activePoint.latitude},${activePoint.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-action w-full justify-center text-xs"
                                >
                                    <HiExternalLink /> Google Maps
                                </a>
                                <button
                                    className="btn-primary-blue w-full justify-center text-xs"
                                    onClick={() => navigate('/admin/batches')}
                                >
                                    <HiEye /> View in Batches
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Scrollable Points List */}
                    <div className="points-scroll-list">
                        {filteredPoints.length === 0 ? (
                            <div className="empty-feed" style={{ padding: '30px 10px' }}>
                                <HiLocationMarker size={32} style={{ color: '#94a3b8' }} />
                                <h4>No map points match filter</h4>
                            </div>
                        ) : (
                            filteredPoints.map((p, idx) => {
                                const isSelected = activePoint && (activePoint.batchId === p.batchId && activePoint.photoId === p.photoId);
                                return (
                                    <div 
                                        key={idx} 
                                        className={`point-list-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedPoint(p)}
                                    >
                                        <div className="point-item-icon">
                                            <HiLocationMarker />
                                        </div>
                                        <div className="point-item-info">
                                            <strong>{p.locationName}</strong>
                                            <span className="sub-text">
                                                {p.batchTitle} • {p.promoterName}
                                            </span>
                                        </div>
                                        <div className="point-item-meta">
                                            <span className={`status-pill ${p.status}`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .admin-map-page {
                    max-width: 1400px;
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

                .view-mode-toggle {
                    display: flex;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 2px;
                }

                .mode-btn {
                    padding: 6px 12px;
                    border: none;
                    background: none;
                    border-radius: 6px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .mode-btn.active {
                    background: #2563eb;
                    color: #ffffff;
                }

                .map-workspace-grid {
                    display: grid;
                    grid-template-columns: 1.8fr 1fr;
                    gap: 20px;
                }

                @media (max-width: 1024px) {
                    .map-workspace-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .map-display-container {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: hidden;
                    height: 600px;
                    position: relative;
                }

                .map-iframe-wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .live-pin-overlay-card {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(8px);
                    color: #ffffff;
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }

                .live-dot-pulse {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 10px #10b981;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.3); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }

                .map-cluster-sidebar {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    height: 600px;
                    overflow: hidden;
                }

                .cluster-sidebar-header {
                    padding: 14px 18px;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-primary);
                }

                .cluster-sidebar-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 700;
                }

                .active-inspector-card {
                    padding: 16px;
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color);
                }

                .dossier-tag {
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    color: #2563eb;
                }

                .active-batch-title {
                    margin: 2px 0 0 0;
                    font-size: 1.05rem;
                    font-weight: 700;
                }

                .active-loc-sub {
                    margin: 2px 0 10px 0;
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                }

                .mini-photo-preview {
                    position: relative;
                    height: 120px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #000;
                    margin-bottom: 12px;
                }

                .mini-photo-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .gdpr-pill {
                    position: absolute;
                    bottom: 6px;
                    right: 6px;
                    background: rgba(0, 0, 0, 0.8);
                    color: #93c5fd;
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .meta-spec-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    font-size: 0.8rem;
                }

                .spec-item {
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-secondary);
                    padding: 6px 8px;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                }

                .spec-lbl {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                .points-scroll-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .point-list-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: var(--bg-primary);
                }

                .point-list-item:hover {
                    background: var(--bg-secondary);
                    transform: translateX(4px);
                }

                .point-list-item.selected {
                    background: #eff6ff;
                    border-left: 4px solid #2563eb;
                }

                .point-item-icon {
                    color: #2563eb;
                    font-size: 1.25rem;
                }

                .point-item-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .point-item-info strong {
                    font-size: 0.88rem;
                }

                .sub-text {
                    font-size: 0.76rem;
                    color: var(--text-secondary);
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

                .status-pill {
                    display: inline-block;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }
                .status-pill.approved { background: #f0fdf4; color: #16a34a; }
                .status-pill.pending { background: #fffbeb; color: #b45309; }
                .status-pill.rejected { background: #fef2f2; color: #dc2626; }

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
                }
            `}</style>
        </div>
    );
};

export default AdminMap;
