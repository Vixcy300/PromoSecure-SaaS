import { useEffect, useRef } from 'react';
import { HiLocationMarker } from 'react-icons/hi';

// Note: Leaflet CSS must be imported in main.jsx or index.html
// For now using a simple preview - full map integration requires Leaflet setup

const LocationMap = ({ photos, className = '' }) => {
    const mapRef = useRef(null);

    // Filter photos with valid location data
    const photosWithLocation = photos?.filter(p =>
        p.location?.latitude && p.location?.longitude
    ) || [];

    if (photosWithLocation.length === 0) {
        return (
            <div className={`location-map-empty ${className}`}>
                <div className="empty-content">
                    <HiLocationMarker className="empty-icon" />
                    <p>No location data available</p>
                    <span>Photos captured without GPS will appear here without markers</span>
                </div>
                <style>{`
          .location-map-empty {
            background: var(--bg-tertiary);
            border-radius: var(--radius-xl);
            padding: 3rem;
            text-align: center;
            border: 1px dashed var(--border-color);
          }
          .empty-icon {
            font-size: 3rem;
            color: var(--text-light);
            margin-bottom: 1rem;
          }
          .empty-content p {
            color: var(--text-secondary);
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          .empty-content span {
            color: var(--text-muted);
            font-size: 0.875rem;
          }
        `}</style>
            </div>
        );
    }

    // Calculate center point
    const centerLat = photosWithLocation.reduce((sum, p) => sum + p.location.latitude, 0) / photosWithLocation.length;
    const centerLng = photosWithLocation.reduce((sum, p) => sum + p.location.longitude, 0) / photosWithLocation.length;

    return (
        <div className={`location-map ${className}`}>
            <div className="map-header">
                <HiLocationMarker />
                <span>Photo Locations ({photosWithLocation.length})</span>
            </div>

            <div className="map-container" ref={mapRef}>
                {/* Static map preview using OpenStreetMap */}
                <img
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${centerLat},${centerLng}&zoom=14&size=600x300&maptype=mapnik${photosWithLocation.map(p => `&markers=${p.location.latitude},${p.location.longitude},red-pushpin`).join('')}`}
                    alt="Photo locations map"
                    className="map-image"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                />
                <div className="map-fallback" style={{ display: 'none' }}>
                    <p>Map preview unavailable</p>
                </div>
            </div>

            <div className="location-list">
                {photosWithLocation.map((photo, index) => (
                    <div key={photo._id || index} className="location-item">
                        <div className="location-marker">{index + 1}</div>
                        <div className="location-details">
                            <span className="location-coords">
                                {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                            </span>
                            {photo.location.address && (
                                <span className="location-address">{photo.location.address}</span>
                            )}
                            <span className="location-time">
                                {new Date(photo.capturedAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .location-map {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .map-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
          font-weight: 600;
          color: var(--text-primary);
        }

        .map-header svg {
          color: var(--brand-primary);
          font-size: 1.25rem;
        }

        .map-container {
          height: 200px;
          background: var(--bg-tertiary);
          position: relative;
        }

        .map-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .map-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .location-list {
          padding: 1rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .location-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .location-item:last-child {
          border-bottom: none;
        }

        .location-marker {
          width: 28px;
          height: 28px;
          background: var(--brand-gradient);
          color: white;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .location-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .location-coords {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .location-address {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .location-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
};

export default LocationMap;
