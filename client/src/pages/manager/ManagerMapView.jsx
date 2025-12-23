import { useState, useEffect, useMemo } from 'react';
import { HiMap, HiLocationMarker, HiCamera, HiUser, HiPhotograph, HiFilter, HiX, HiChevronLeft, HiExternalLink, HiEye } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManagerMapView = () => {
    const [photos, setPhotos] = useState([]);
    const [batches, setBatches] = useState([]);
    const [promoters, setPromoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [mobileView, setMobileView] = useState('list');
    const [hoveredPhoto, setHoveredPhoto] = useState(null);

    const [selectedBatch, setSelectedBatch] = useState('all');
    const [selectedPromoter, setSelectedPromoter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const batchRes = await api.get('/batches');
            setBatches(batchRes.data.batches || []);

            const uniquePromoters = [];
            const promoterIds = new Set();
            batchRes.data.batches.forEach(b => {
                if (b.promoter && !promoterIds.has(b.promoter._id)) {
                    promoterIds.add(b.promoter._id);
                    uniquePromoters.push(b.promoter);
                }
            });
            setPromoters(uniquePromoters);

            const allPhotos = [];
            for (const batch of batchRes.data.batches) {
                if (batch.photoCount > 0) {
                    try {
                        const photoRes = await api.get(`/batches/${batch._id}`);
                        const batchPhotos = (photoRes.data.photos || [])
                            .filter(p => p.location?.latitude && p.location?.longitude)
                            .map(p => ({
                                ...p,
                                batchId: batch._id,
                                batchTitle: batch.title,
                                promoterName: batch.promoter?.name,
                                promoterId: batch.promoter?._id
                            }));
                        allPhotos.push(...batchPhotos);
                    } catch (err) {
                        console.log(`Could not fetch photos for batch ${batch._id}`);
                    }
                }
            }
            setPhotos(allPhotos);
            if (allPhotos.length > 0) setSelectedPhoto(allPhotos[0]);
        } catch (error) {
            toast.error('Failed to load map data');
        } finally {
            setLoading(false);
        }
    };

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => {
            if (selectedBatch !== 'all' && photo.batchId !== selectedBatch) return false;
            if (selectedPromoter !== 'all' && photo.promoterId !== selectedPromoter) return false;
            return true;
        });
    }, [photos, selectedBatch, selectedPromoter]);

    const getMapUrl = (lat, lng) => {
        return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.015}%2C${lng + 0.015}%2C${lat + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`;
    };

    const openInMaps = (lat, lng) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const handlePhotoClick = (photo) => {
        setSelectedPhoto(photo);
        setMobileView('map');
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page map-page">
            {/* Header */}
            <div className="map-header">
                <div className="header-left">
                    <h1><HiMap /> Photo Locations</h1>
                    <span className="location-badge">
                        <HiLocationMarker /> {filteredPhotos.length} {filteredPhotos.length === 1 ? 'location' : 'locations'}
                    </span>
                </div>
                <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                    <HiFilter /> {showFilters ? 'Hide' : 'Filters'}
                </button>
            </div>

            {/* Mobile View Toggle */}
            <div className="mobile-tabs">
                <button className={`tab ${mobileView === 'list' ? 'active' : ''}`} onClick={() => setMobileView('list')}>
                    <HiPhotograph /> Photos ({filteredPhotos.length})
                </button>
                <button className={`tab ${mobileView === 'map' ? 'active' : ''}`} onClick={() => setMobileView('map')}>
                    <HiMap /> Map
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="filters-card">
                    <div className="filters-header">
                        <h4><HiFilter /> Filter Photos</h4>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters(false)}><HiX /></button>
                    </div>
                    <div className="filters-grid">
                        <div className="input-group">
                            <label><HiCamera /> Batch</label>
                            <select className="input" value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}>
                                <option value="all">All Batches ({batches.length})</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label><HiUser /> Promoter</label>
                            <select className="input" value={selectedPromoter} onChange={e => setSelectedPromoter(e.target.value)}>
                                <option value="all">All Promoters ({promoters.length})</option>
                                {promoters.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="map-content">
                {/* Photo Gallery */}
                <div className={`gallery-panel ${mobileView !== 'list' ? 'mobile-hidden' : ''}`}>
                    <div className="gallery-header">
                        <h3><HiPhotograph /> Photos with GPS</h3>
                    </div>
                    {filteredPhotos.length === 0 ? (
                        <div className="empty-state">
                            <HiLocationMarker size={56} />
                            <h3>No Locations Found</h3>
                            <p>Photos with GPS data will appear here</p>
                        </div>
                    ) : (
                        <div className="photo-gallery">
                            {filteredPhotos.map((photo, i) => (
                                <div
                                    key={photo._id || i}
                                    className={`gallery-item ${selectedPhoto?._id === photo._id ? 'selected' : ''} ${hoveredPhoto?._id === photo._id ? 'hovered' : ''}`}
                                    onClick={() => handlePhotoClick(photo)}
                                    onMouseEnter={() => setHoveredPhoto(photo)}
                                    onMouseLeave={() => setHoveredPhoto(null)}
                                >
                                    <div className="gallery-img-wrap">
                                        <img src={photo.blurredImage} alt="Photo" />
                                        <div className="gallery-overlay">
                                            <HiEye size={24} />
                                            <span>View Location</span>
                                        </div>
                                        <span className={`status-badge ${photo.aiMetadata?.isUnique !== false ? 'verified' : 'duplicate'}`}>
                                            {photo.aiMetadata?.isUnique !== false ? '✓' : '⚠'}
                                        </span>
                                    </div>
                                    <div className="gallery-details">
                                        <strong>{photo.batchTitle}</strong>
                                        <span className="promoter-name">by {photo.promoterName}</span>
                                        <span className="coords">
                                            <HiLocationMarker />
                                            {photo.location.latitude.toFixed(4)}, {photo.location.longitude.toFixed(4)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map Panel */}
                <div className={`map-panel ${mobileView !== 'map' ? 'mobile-hidden' : ''}`}>
                    {mobileView === 'map' && (
                        <button className="back-btn" onClick={() => setMobileView('list')}>
                            <HiChevronLeft /> Back to Photos
                        </button>
                    )}

                    <div className="map-wrapper">
                        <iframe
                            title="Location Map"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            src={selectedPhoto
                                ? getMapUrl(selectedPhoto.location.latitude, selectedPhoto.location.longitude)
                                : `https://www.openstreetmap.org/export/embed.html?bbox=68.1%2C8.0%2C97.4%2C37.0&layer=mapnik`
                            }
                        ></iframe>
                        {!selectedPhoto && (
                            <div className="map-placeholder">
                                <HiLocationMarker size={48} />
                                <p>Select a photo to view its location</p>
                            </div>
                        )}
                    </div>

                    {/* Selected Photo Details */}
                    {selectedPhoto && (
                        <div className="location-details">
                            <img src={selectedPhoto.blurredImage} alt="Selected" className="detail-thumb" />
                            <div className="detail-info">
                                <h4>{selectedPhoto.batchTitle}</h4>
                                <p className="promoter">by {selectedPhoto.promoterName}</p>
                                <div className="coord-row">
                                    <HiLocationMarker />
                                    <span className="coord-text">
                                        {selectedPhoto.location.latitude.toFixed(6)}, {selectedPhoto.location.longitude.toFixed(6)}
                                    </span>
                                </div>
                                <p className="timestamp">
                                    📅 {new Date(selectedPhoto.capturedAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="detail-actions">
                                <span className={`badge ${selectedPhoto.aiMetadata?.isUnique !== false ? 'badge-approved' : 'badge-rejected'}`}>
                                    {selectedPhoto.aiMetadata?.isUnique !== false ? '✓ Verified' : '⚠ Duplicate'}
                                </span>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openInMaps(selectedPhoto.location.latitude, selectedPhoto.location.longitude)}
                                >
                                    <HiExternalLink /> Open in Maps
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .map-page { display: flex; flex-direction: column; height: calc(100vh - 60px); gap: 1rem; overflow: hidden; }
                
                .map-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
                .map-header h1 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; margin: 0; }
                .map-header h1 svg { color: var(--brand-primary); }
                .header-left { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
                
                .location-badge { 
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    padding: 0.4rem 0.85rem; background: var(--primary-50); color: var(--brand-primary);
                    border-radius: var(--radius-full); font-weight: 600; font-size: 0.85rem;
                }
                
                .mobile-tabs { display: none; background: var(--bg-card); border-radius: var(--radius-lg); padding: 0.25rem; border: 1px solid var(--border-color); }
                .mobile-tabs .tab { flex: 1; padding: 0.75rem; border: none; background: none; border-radius: var(--radius-md); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; color: var(--text-muted); transition: all 0.2s; }
                .mobile-tabs .tab.active { background: var(--brand-primary); color: white; }
                
                .filters-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 1rem; border: 1px solid var(--border-color); margin-bottom: 0.5rem; animation: slideDown 0.2s ease; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .filters-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .filters-header h4 { margin: 0; display: flex; align-items: center; gap: 0.5rem; }
                .filters-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                .map-content { flex: 1; display: grid; grid-template-columns: 400px 1fr; gap: 1rem; min-height: 0; overflow: hidden; }
                
                .gallery-panel { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; display: flex; flex-direction: column; }
                .gallery-header { padding: 1rem; border-bottom: 1px solid var(--border-color); }
                .gallery-header h3 { margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; }
                
                .photo-gallery { flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
                
                .gallery-item { 
                    display: flex; gap: 1rem; padding: 0.75rem; background: var(--bg-tertiary); 
                    border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s;
                    border: 2px solid transparent;
                }
                .gallery-item:hover { background: var(--bg-elevated); transform: translateX(4px); }
                .gallery-item.selected { border-color: var(--brand-primary); background: var(--primary-50); }
                .gallery-item.hovered { box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15); }
                
                .gallery-img-wrap { position: relative; width: 100px; height: 75px; flex-shrink: 0; border-radius: var(--radius-md); overflow: hidden; }
                .gallery-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
                .gallery-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: white; font-size: 0.75rem; gap: 0.25rem; }
                .gallery-item:hover .gallery-overlay { opacity: 1; }
                .status-badge { position: absolute; top: 5px; right: 5px; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: white; border: 2px solid white; }
                .status-badge.verified { background: var(--success); }
                .status-badge.duplicate { background: var(--warning); }
                
                .gallery-details { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
                .gallery-details strong { font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .promoter-name { font-size: 0.8rem; color: var(--text-muted); }
                .coords { font-size: 0.75rem; color: var(--brand-primary); display: flex; align-items: center; gap: 0.25rem; font-family: monospace; }
                
                .map-panel { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; display: flex; flex-direction: column; }
                .map-wrapper { flex: 1; position: relative; min-height: 300px; }
                .map-wrapper iframe { border: none; }
                .map-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 0.5rem; background: var(--bg-tertiary); }
                
                .back-btn { display: none; margin: 0.5rem; padding: 0.5rem 1rem; background: var(--bg-tertiary); border: none; border-radius: var(--radius-md); cursor: pointer; display: flex; align-items: center; gap: 0.25rem; font-weight: 500; }
                
                .location-details { display: flex; gap: 1rem; padding: 1rem; border-top: 1px solid var(--border-color); background: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-card) 100%); align-items: flex-start; flex-wrap: wrap; }
                .detail-thumb { width: 90px; height: 70px; object-fit: cover; border-radius: var(--radius-md); border: 2px solid var(--brand-primary); }
                .detail-info { flex: 1; min-width: 150px; }
                .detail-info h4 { margin: 0 0 0.25rem; font-size: 1rem; }
                .detail-info .promoter { margin: 0 0 0.5rem; color: var(--text-muted); font-size: 0.85rem; }
                .coord-row { display: flex; align-items: center; gap: 0.35rem; color: var(--brand-primary); margin-bottom: 0.25rem; }
                .coord-text { font-family: monospace; font-size: 0.85rem; }
                .timestamp { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
                .detail-actions { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; }
                
                .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); gap: 0.75rem; padding: 2rem; text-align: center; }
                .empty-state h3 { margin: 0; }
                .empty-state p { margin: 0; }
                
                @media (max-width: 900px) {
                    .map-content { grid-template-columns: 1fr; }
                    .mobile-tabs { display: flex; }
                    .mobile-hidden { display: none !important; }
                    .back-btn { display: flex !important; }
                    .filters-grid { grid-template-columns: 1fr; }
                    .gallery-item { flex-direction: column; }
                    .gallery-img-wrap { width: 100%; height: 150px; }
                    .location-details { padding: 0.75rem; }
                    .detail-thumb { width: 70px; height: 55px; }
                }
                
                @media (max-width: 480px) {
                    .map-header h1 { font-size: 1.25rem; }
                    .location-badge { font-size: 0.75rem; padding: 0.3rem 0.6rem; }
                }
            `}</style>
        </div>
    );
};

export default ManagerMapView;
