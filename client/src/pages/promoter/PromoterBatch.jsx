import { useState, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCamera, HiTrash, HiPaperAirplane, HiPhotograph, HiCloudUpload, HiWifi } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CameraCapture from '../../components/CameraCapture';
import { saveOfflinePhoto, getOfflinePhotos, deleteOfflinePhoto, getOfflineBatches } from '../../utils/db';

const PromoterBatch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [offlinePhotos, setOfflinePhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            fetchBatch();
        };
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        fetchBatch();
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [id, isOffline]);

    const fetchBatch = async () => {
        try {
            if (id.startsWith('offline-')) {
                const offlineBatchesList = await getOfflineBatches();
                const offlineBatch = offlineBatchesList.find(b => b.tempId === id);
                if (offlineBatch) {
                    setBatch(offlineBatch);
                } else {
                    toast.error('Offline batch not found');
                    navigate('/promoter');
                }
            } else if (!isOffline) {
                const res = await api.get(`/batches/${id}`);
                setBatch(res.data.batch);
                setPhotos(res.data.photos);
            }

            const offlinePs = await getOfflinePhotos(id);
            setOfflinePhotos(offlinePs || []);

        } catch (error) {
            if (isOffline && !id.startsWith('offline-')) {
                toast.error('Cannot load full batch details while offline');
            } else {
                toast.error('Failed to load batch');
                navigate('/promoter');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoCapture = async (photoData) => {
        setShowCamera(false);
        const payload = {
            batchId: id,
            originalImage: photoData.originalImage,
            blurredImage: photoData.blurredImage,
            aiMetadata: photoData.aiMetadata,
            location: photoData.location,
        };

        if (isOffline || id.startsWith('offline-')) {
            try {
                await saveOfflinePhoto(payload);
                toast.success('Photo saved offline!');
                fetchBatch();
            } catch (err) {
                toast.error('Failed to save photo offline');
            }
        } else {
            try {
                await api.post('/photos', payload);
                toast.success('Photo added to batch!');
                fetchBatch();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to save photo');
            }
        }
    };

    const handleDeletePhoto = async (photoId, isOfflinePhoto = false) => {
        if (!confirm('Delete this photo?')) return;
        
        try {
            if (isOfflinePhoto) {
                await deleteOfflinePhoto(photoId);
                toast.success('Offline photo deleted');
            } else {
                if (isOffline) {
                    toast.error('Cannot delete online photos while offline');
                    return;
                }
                await api.delete(`/photos/${photoId}`);
                toast.success('Photo deleted');
            }
            fetchBatch();
        } catch (error) {
            toast.error('Failed to delete photo');
        }
    };

    const handleSubmit = async () => {
        const totalPhotos = photos.length + offlinePhotos.length;
        if (totalPhotos === 0) {
            toast.error('Add at least one photo before submitting');
            return;
        }

        if (isOffline || id.startsWith('offline-')) {
            toast.error('You must be online and synced to submit a batch for review.');
            return;
        }

        if (!confirm('Submit this batch for review? You cannot add more photos after submission.')) {
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/batches/${id}/submit`);
            toast.success('Batch submitted for review!');
            navigate('/promoter');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit batch');
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <Spinner size={24} />
            </div>
        );
    }

    if (!batch) {
        return null;
    }

    const isDraft = batch.status === 'draft';
    const allPhotos = [...offlinePhotos.map(p => ({...p, isOfflineSync: true})), ...photos];

    return (
        <div className="page">
            <button className="btn btn-ghost mb-2" onClick={() => navigate('/promoter')}>
                <HiArrowLeft /> Back to Batches
            </button>

            <div className="batch-header card mb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2>{batch.title}</h2>
                            <span className={`badge badge-${batch.status}`}>{batch.status}</span>
                            {id.startsWith('offline-') && (
                                <span className="badge badge-warning flex items-center gap-1 text-xs">
                                    <HiCloudUpload /> Offline Batch
                                </span>
                            )}
                        </div>
                        <p className="text-muted">{batch.description || 'No description'}</p>
                        {batch.location && (
                            <p className="text-sm text-muted mt-1">📍 {batch.location}</p>
                        )}
                    </div>
                    {isDraft && (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting || allPhotos.length === 0 || isOffline || id.startsWith('offline-')}
                            title={isOffline ? "Cannot submit while offline" : ""}
                        >
                            {submitting ? (
                                <Spinner size={18} />
                            ) : (
                                <>
                                    <HiPaperAirplane /> Submit Batch
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {batch.reviewNote && (
                <div
                    className="card mb-2"
                    style={{
                        background: batch.status === 'rejected' ? 'var(--error-bg)' : 'var(--success-bg)',
                        borderColor: batch.status === 'rejected' ? 'var(--error)' : 'var(--success)'
                    }}
                >
                    <p style={{ color: batch.status === 'rejected' ? 'var(--error)' : 'var(--success)', margin: 0 }}>
                        <strong>Manager Note:</strong> {batch.reviewNote}
                    </p>
                </div>
            )}

            <div className="flex justify-between items-center mb-2">
                <h3>
                    <HiPhotograph style={{ marginRight: '0.5rem' }} />
                    Photos ({allPhotos.length})
                </h3>
                {isDraft && (
                    <button className="btn btn-primary" onClick={() => setShowCamera(true)}>
                        <HiCamera /> Capture Photo
                    </button>
                )}
            </div>

            {allPhotos.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📷</div>
                    <h3>No Photos Yet</h3>
                    <p className="text-muted">
                        {isDraft
                            ? 'Start capturing photos with the public. Faces will be automatically blurred for privacy.'
                            : 'This batch has no photos.'}
                    </p>
                    {isDraft && (
                        <button className="btn btn-primary mt-2" onClick={() => setShowCamera(true)}>
                            <HiCamera /> Capture First Photo
                        </button>
                    )}
                </div>
            ) : (
                <div className="photo-grid">
                    {allPhotos.map((photo, index) => (
                        <div key={photo._id || photo.id} className="photo-item">
                            <img
                                src={photo.blurredImage}
                                alt={`Photo ${index + 1}`}
                            />
                            <div className="photo-overlay">
                                <div className="photo-info flex flex-col gap-1">
                                    {photo.isOfflineSync && (
                                        <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '10px' }}>
                                            <HiCloudUpload /> PENDING SYNC
                                        </span>
                                    )}
                                    <span className={`badge ${photo.aiMetadata?.isUnique === false ? 'badge-rejected' : 'badge-approved'}`}>
                                        {photo.aiMetadata?.isUnique === false ? '⚠ DUPLICATE' : '✓ UNIQUE'}
                                    </span>
                                    <span className="text-sm">
                                        {photo.aiMetadata?.facesDetected || 0} face(s)
                                    </span>
                                </div>
                                {isDraft && (
                                    <button
                                        className="btn btn-icon btn-danger"
                                        onClick={() => handleDeletePhoto(photo._id || photo.id, photo.isOfflineSync)}
                                    >
                                        <HiTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {allPhotos.length > 0 && (
                <div className="card mt-2 ai-summary-card">
                    <h3 className="mb-1">🤖 AI Verification Summary</h3>
                    <div className="grid grid-4">
                        <div className="ai-stat">
                            <span className="ai-stat-value">
                                {allPhotos.filter(p => p.aiMetadata?.isUnique !== false).length}
                            </span>
                            <span className="ai-stat-label">Unique People</span>
                        </div>
                        <div className="ai-stat">
                            <span className="ai-stat-value">
                                {allPhotos.reduce((sum, p) => sum + (p.aiMetadata?.facesDetected || 0), 0)}
                            </span>
                            <span className="ai-stat-label">Total Faces</span>
                        </div>
                        <div className="ai-stat">
                            <span className="ai-stat-value" style={{ color: allPhotos.filter(p => p.aiMetadata?.isUnique === false).length > 0 ? 'var(--error)' : 'var(--text-primary)' }}>
                                {allPhotos.filter(p => p.aiMetadata?.isUnique === false).length}
                            </span>
                            <span className="ai-stat-label">Duplicates</span>
                        </div>
                        <div className="ai-stat">
                            <span
                                className="ai-stat-value"
                                style={{
                                    color: allPhotos.filter(p => p.aiMetadata?.isUnique !== false).length / allPhotos.length > 0.8
                                        ? 'var(--success)'
                                        : 'var(--warning)'
                                }}
                            >
                                {Math.round((allPhotos.filter(p => p.aiMetadata?.isUnique !== false).length / allPhotos.length) * 100) || 0}%
                            </span>
                            <span className="ai-stat-label">Score</span>
                        </div>
                    </div>
                </div>
            )}

            {showCamera && (
                <CameraCapture
                    onCapture={handlePhotoCapture}
                    onClose={() => setShowCamera(false)}
                    existingPhotos={allPhotos}
                />
            )}

            <style>{`
        .batch-header h2 {
          margin: 0;
        }

        .photo-item {
          position: relative;
        }

        .photo-item .photo-overlay {
          opacity: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
        }

        .photo-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ai-summary-card {
          background: linear-gradient(135deg, rgba(13, 148, 136, 0.1), rgba(20, 184, 166, 0.1));
          border-color: var(--brand-primary);
        }

        .ai-stat {
          text-align: center;
        }

        .ai-stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .ai-stat-label {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
      `}</style>
        </div>
    );
};

export default PromoterBatch;
