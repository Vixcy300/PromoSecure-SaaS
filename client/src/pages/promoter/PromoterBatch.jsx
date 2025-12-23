import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCamera, HiTrash, HiPaperAirplane, HiPhotograph } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CameraCapture from '../../components/CameraCapture';

const PromoterBatch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batch, setBatch] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBatch();
    }, [id]);

    const fetchBatch = async () => {
        try {
            const res = await api.get(`/batches/${id}`);
            setBatch(res.data.batch);
            setPhotos(res.data.photos);
        } catch (error) {
            toast.error('Failed to load batch');
            navigate('/promoter');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoCapture = async (photoData) => {
        setShowCamera(false);
        try {
            await api.post('/photos', {
                batchId: id,
                originalImage: photoData.originalImage,
                blurredImage: photoData.blurredImage,
                aiMetadata: photoData.aiMetadata,
                location: photoData.location,
            });
            toast.success('Photo added to batch!');
            fetchBatch();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save photo');
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!confirm('Delete this photo?')) return;
        try {
            await api.delete(`/photos/${photoId}`);
            toast.success('Photo deleted');
            fetchBatch();
        } catch (error) {
            toast.error('Failed to delete photo');
        }
    };

    const handleSubmit = async () => {
        if (photos.length === 0) {
            toast.error('Add at least one photo before submitting');
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
                <div className="spinner"></div>
            </div>
        );
    }

    if (!batch) {
        return null;
    }

    const isDraft = batch.status === 'draft';

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
                            disabled={submitting || photos.length === 0}
                        >
                            {submitting ? (
                                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
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
                    Photos ({photos.length})
                </h3>
                {isDraft && (
                    <button className="btn btn-primary" onClick={() => setShowCamera(true)}>
                        <HiCamera /> Capture Photo
                    </button>
                )}
            </div>

            {photos.length === 0 ? (
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
                    {photos.map((photo, index) => (
                        <div key={photo._id} className="photo-item">
                            <img
                                src={photo.blurredImage}
                                alt={`Photo ${index + 1}`}
                            />
                            <div className="photo-overlay">
                                <div className="photo-info">
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
                                        onClick={() => handleDeletePhoto(photo._id)}
                                    >
                                        <HiTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Summary - shows for all batches with photos */}
            {photos.length > 0 && (
                <div className="card mt-2 ai-summary-card">
                    <h3 className="mb-1">🤖 AI Verification Summary</h3>
                    <div className="grid grid-4">
                        <div className="ai-stat">
                            <span className="ai-stat-value">
                                {photos.filter(p => p.aiMetadata?.isUnique !== false).length}
                            </span>
                            <span className="ai-stat-label">Unique People</span>
                        </div>
                        <div className="ai-stat">
                            <span className="ai-stat-value">
                                {photos.reduce((sum, p) => sum + (p.aiMetadata?.facesDetected || 0), 0)}
                            </span>
                            <span className="ai-stat-label">Total Faces</span>
                        </div>
                        <div className="ai-stat">
                            <span className="ai-stat-value" style={{ color: photos.filter(p => p.aiMetadata?.isUnique === false).length > 0 ? 'var(--error)' : 'var(--text-primary)' }}>
                                {photos.filter(p => p.aiMetadata?.isUnique === false).length}
                            </span>
                            <span className="ai-stat-label">Duplicates</span>
                        </div>
                        <div className="ai-stat">
                            <span
                                className="ai-stat-value"
                                style={{
                                    color: photos.filter(p => p.aiMetadata?.isUnique !== false).length / photos.length > 0.8
                                        ? 'var(--success)'
                                        : 'var(--warning)'
                                }}
                            >
                                {Math.round((photos.filter(p => p.aiMetadata?.isUnique !== false).length / photos.length) * 100)}%
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
                    existingPhotos={photos}
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
