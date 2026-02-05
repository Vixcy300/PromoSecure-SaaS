import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiCollection, HiCheckCircle, HiXCircle, HiArrowLeft, HiEye, HiTrash, HiDownload, HiMail, HiX } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManagerBatches = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewNote, setReviewNote] = useState('');
    const [filter, setFilter] = useState('all');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({ email: '', message: '' });

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (id) {
            fetchBatchDetails(id);
        } else {
            setSelectedBatch(null);
            setPhotos([]);
        }
    }, [id]);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data.batches);
        } catch (error) {
            toast.error('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatchDetails = async (batchId) => {
        try {
            const res = await api.get(`/batches/${batchId}`);
            setSelectedBatch(res.data.batch);
            setPhotos(res.data.photos);
        } catch (error) {
            toast.error('Failed to load batch details');
        }
    };

    const handleReview = async (action) => {
        try {
            await api.put(`/batches/${selectedBatch._id}/review`, { action, note: reviewNote });
            toast.success(`Batch ${action}d successfully`);
            setReviewNote('');
            fetchBatches();
            navigate('/manager/batches');
        } catch (error) {
            toast.error('Failed to review batch');
        }
    };

    const handleDeleteBatch = async (batchId, photoCount, e) => {
        e.stopPropagation(); // Prevent navigation
        const confirmMessage = photoCount > 0
            ? `Delete this batch and its ${photoCount} photo(s)? This action cannot be undone.`
            : 'Delete this empty batch?';

        if (!confirm(confirmMessage)) return;

        try {
            await api.delete(`/batches/${batchId}`);
            toast.success(`Batch deleted${photoCount > 0 ? ` (${photoCount} photos removed)` : ''}`);
            fetchBatches();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete batch');
        }
    };

    const handleDownloadReport = async () => {
        try {
            toast.loading('Generating report...');
            const response = await api.get(`/batches/${selectedBatch._id}/report`, {
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `PromoSecure_Report_${selectedBatch.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success('Report downloaded!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate report');
            console.error(error);
        }
    };

    const handleEmailReport = async () => {
        if (!emailData.email) {
            toast.error('Please enter recipient email');
            return;
        }

        try {
            toast.loading('Sending email...');
            await api.post(`/batches/${selectedBatch._id}/email-report`, {
                email: emailData.email,
                message: emailData.message
            });

            toast.dismiss();
            toast.success(`Report sent to ${emailData.email}`);
            setShowEmailModal(false);
            setEmailData({ email: '', message: '' });
        } catch (error) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'Failed to send email');
        }
    };

    const filteredBatches = filter === 'all'
        ? batches
        : batches.filter(b => b.status === filter);

    if (selectedBatch) {
        return (
            <div className="page">
                <div className="flex justify-between items-center mb-2">
                    <button className="btn btn-ghost" onClick={() => navigate('/manager/batches')}>
                        <HiArrowLeft /> Back to Batches
                    </button>
                    <div className="flex gap-1">
                        <button className="btn btn-secondary" onClick={() => {
                            setEmailData({
                                email: selectedBatch.client?.contactEmail || '',
                                message: ''
                            });
                            setShowEmailModal(true);
                        }}>
                            <HiMail /> Email Report
                        </button>
                        <button className="btn btn-primary" onClick={handleDownloadReport}>
                            <HiDownload /> Download
                        </button>
                    </div>
                </div>

                <div className="card mb-2">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h2>{selectedBatch.title}</h2>
                            <p className="text-muted">{selectedBatch.description || 'No description'}</p>
                        </div>
                        <span className={`badge badge-${selectedBatch.status}`}>{selectedBatch.status}</span>
                    </div>

                    <div className="batch-meta">
                        <div>
                            <span className="text-muted">Promoter:</span>
                            <span>{selectedBatch.promoter?.name}</span>
                        </div>
                        <div>
                            <span className="text-muted">Location:</span>
                            <span>{selectedBatch.location || '—'}</span>
                        </div>
                        <div>
                            <span className="text-muted">Photos:</span>
                            <span>{selectedBatch.photoCount}</span>
                        </div>
                    </div>
                </div>

                {selectedBatch.status !== 'draft' && selectedBatch.aiSummary && (
                    <div className="card mb-2 ai-summary">
                        <h3 className="mb-1">🤖 AI Verification Summary</h3>
                        <div className="grid grid-4">
                            <div className="ai-stat">
                                <span className="ai-stat-value">{selectedBatch.aiSummary.uniquePeopleCount}</span>
                                <span className="ai-stat-label">Unique People</span>
                            </div>
                            <div className="ai-stat">
                                <span className="ai-stat-value">{selectedBatch.aiSummary.totalFacesDetected}</span>
                                <span className="ai-stat-label">Faces Detected</span>
                            </div>
                            <div className="ai-stat">
                                <span className="ai-stat-value">{selectedBatch.aiSummary.duplicatesFound}</span>
                                <span className="ai-stat-label">Duplicates</span>
                            </div>
                            <div className="ai-stat">
                                <span className="ai-stat-value" style={{ color: selectedBatch.aiSummary.verificationScore > 80 ? 'var(--success)' : 'var(--warning)' }}>
                                    {selectedBatch.aiSummary.verificationScore}%
                                </span>
                                <span className="ai-stat-label">Verification Score</span>
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="mb-1">Photos (Blurred for Privacy)</h3>
                <div className="photo-grid mb-2">
                    {photos.map((photo, index) => (
                        <div key={photo._id} className="photo-item">
                            <img src={photo.blurredImage} alt={`Photo ${index + 1}`} />
                            <div className="photo-overlay">
                                <span className={`badge ${photo.aiMetadata?.isUnique ? 'badge-approved' : 'badge-rejected'}`}>
                                    {photo.aiMetadata?.isUnique ? 'Unique' : 'Duplicate'}
                                </span>
                                <span className="text-sm">{photo.aiMetadata?.facesDetected || 0} faces</span>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedBatch.status === 'pending' && (
                    <div className="card review-section">
                        <h3 className="mb-1">Review This Batch</h3>
                        <div className="input-group mb-2">
                            <label>Review Note (Optional)</label>
                            <textarea
                                className="input"
                                placeholder="Add a note for the promoter..."
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-success" onClick={() => handleReview('approve')}>
                                <HiCheckCircle /> Approve Batch
                            </button>
                            <button className="btn btn-danger" onClick={() => handleReview('reject')}>
                                <HiXCircle /> Reject Batch
                            </button>
                        </div>
                    </div>
                )}

                {/* Email Report Modal */}
                {showEmailModal && (
                    <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>📧 Email Report</h3>
                                <button className="btn btn-icon btn-ghost" onClick={() => setShowEmailModal(false)}>
                                    <HiX />
                                </button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted mb-2">Send the PDF report directly to your client</p>
                                <div className="input-group mb-2">
                                    <label>Recipient Email *</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="client@company.com"
                                        value={emailData.email}
                                        onChange={e => setEmailData({ ...emailData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Message (Optional)</label>
                                    <textarea
                                        className="input"
                                        placeholder="Add a personal message to include in the email..."
                                        value={emailData.message}
                                        onChange={e => setEmailData({ ...emailData, message: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-ghost" onClick={() => setShowEmailModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleEmailReport}>
                                    <HiMail /> Send Report
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
          .batch-meta {
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
          }

          .batch-meta div {
            display: flex;
            gap: 0.5rem;
          }

          .ai-summary {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
            border-color: var(--accent-primary);
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

          .review-section {
            background: var(--bg-tertiary);
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1>
                        <HiCollection style={{ color: 'var(--accent-primary)' }} />
                        Batch Reviews
                    </h1>
                    <p>Review and approve submitted batches</p>
                </div>
                <div className="flex gap-1">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                        <button
                            key={f}
                            className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center mt-3">
                    <div className="spinner"></div>
                </div>
            ) : filteredBatches.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No Batches Found</h3>
                    <p className="text-muted">
                        {filter === 'all' ? 'No batches have been submitted yet' : `No ${filter} batches`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-3">
                    {filteredBatches.map((batch) => (
                        <div key={batch._id} className="card batch-card">
                            <div className="flex justify-between items-center mb-1">
                                <h4>{batch.title}</h4>
                                <span className={`badge badge-${batch.status}`}>{batch.status}</span>
                            </div>
                            <p className="text-sm text-muted mb-1">
                                {batch.description || 'No description'}
                            </p>
                            <div className="batch-card-meta">
                                <span>By {batch.promoter?.name}</span>
                                <span>{batch.photoCount} photos</span>
                            </div>
                            <div className="flex gap-1 mt-1">
                                <button
                                    className="btn btn-secondary flex-1"
                                    onClick={() => navigate(`/manager/batches/${batch._id}`)}
                                >
                                    <HiEye /> View
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={(e) => handleDeleteBatch(batch._id, batch.photoCount, e)}
                                    title="Delete batch"
                                >
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .batch-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
};

export default ManagerBatches;
