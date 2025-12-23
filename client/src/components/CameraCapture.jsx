import { useState, useRef, useEffect, useCallback } from 'react';
import { HiCamera, HiSwitchHorizontal, HiX, HiCheck, HiExclamation, HiLocationMarker } from 'react-icons/hi';
import { detectFaces, generateFaceSignature, compareFaceSignatures } from '../ai/FaceDetection';
import { processImage, generateImageHash, compareImageHashes } from '../ai/FaceBlur';
import toast from 'react-hot-toast';

const CameraCapture = ({ onCapture, onClose, existingPhotos = [] }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('environment');
    const [capturing, setCapturing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [preview, setPreview] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    // Get GPS location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    setLocationError('Location unavailable');
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, []);

    const startCamera = useCallback(async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode,
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 },
                },
                audio: false,
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (error) {
            console.error('Camera error:', error);
            toast.error('Failed to access camera. Please check permissions.');
        }
    }, [facingMode]);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const switchCamera = () => {
        const newMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newMode);
        setTimeout(startCamera, 100);
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setCapturing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');

        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(imageDataUrl);
        setCapturing(false);

        await processWithAI(imageDataUrl);
    };

    const processWithAI = async (imageDataUrl) => {
        setProcessing(true);
        setDuplicateWarning(null);

        try {
            // Step 1: Detect faces
            setProcessingStep('Detecting faces...');
            const result = await processImage(imageDataUrl, detectFaces);

            if (result.facesDetected === 0) {
                toast.error('No faces detected. Please ensure face is visible.');
                setPreview(null);
                setProcessing(false);
                return;
            }

            // Step 2: Generate image hash for duplicate detection
            setProcessingStep('Analyzing for duplicates...');
            const imageHash = await generateImageHash(imageDataUrl);

            // Step 3: Generate face signature
            const faceSignature = generateFaceSignature(result.faces, {
                width: canvasRef.current.width,
                height: canvasRef.current.height,
            });

            // Step 4: Check for duplicates against existing photos
            let isDuplicate = false;
            let duplicateSimilarity = 0;
            let duplicatePhoto = null;

            for (const photo of existingPhotos) {
                // Compare image hashes
                if (photo.imageHash) {
                    const hashSimilarity = compareImageHashes(imageHash, photo.imageHash);
                    if (hashSimilarity > 85) {
                        isDuplicate = true;
                        duplicateSimilarity = hashSimilarity;
                        duplicatePhoto = photo;
                        break;
                    }
                }

                // Compare face signatures
                if (photo.aiMetadata?.faceSignature) {
                    const sigSimilarity = compareFaceSignatures(faceSignature, photo.aiMetadata.faceSignature);
                    if (sigSimilarity > 80) {
                        isDuplicate = true;
                        duplicateSimilarity = sigSimilarity;
                        duplicatePhoto = photo;
                        break;
                    }
                }
            }

            setProcessingStep('Blurring faces for privacy...');

            // Add small delay to show blur step
            await new Promise(r => setTimeout(r, 500));

            setProcessedData({
                ...result,
                faceSignature,
                imageHash,
                isDuplicate,
                duplicateSimilarity,
            });

            if (isDuplicate) {
                setDuplicateWarning({
                    similarity: duplicateSimilarity,
                    message: `⚠️ This photo appears ${duplicateSimilarity}% similar to an existing photo!`,
                });
                toast.error(`Duplicate detected! ${duplicateSimilarity}% similar to existing photo.`);
            } else {
                toast.success(`${result.facesDetected} face(s) detected and heavily blurred!`);
            }
        } catch (error) {
            console.error('Processing error:', error);
            toast.error('Failed to process image. Please try again.');
            setPreview(null);
        }
        setProcessing(false);
        setProcessingStep('');
    };

    const confirmPhoto = () => {
        if (processedData) {
            onCapture({
                originalImage: processedData.originalImage,
                blurredImage: processedData.blurredImage,
                location: location,
                aiMetadata: {
                    facesDetected: processedData.facesDetected,
                    faceLocations: processedData.faces,
                    faceSignature: processedData.faceSignature,
                    imageHash: processedData.imageHash,
                    confidence: Math.round(
                        processedData.faces.reduce((sum, f) => sum + (f.confidence || 0.9), 0) /
                        processedData.faces.length * 100
                    ),
                    isUnique: !processedData.isDuplicate,
                    duplicateSimilarity: processedData.duplicateSimilarity,
                },
            });
        }
    };

    const retakePhoto = () => {
        setPreview(null);
        setProcessedData(null);
        setDuplicateWarning(null);
    };

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onClose();
    };

    return (
        <div className="camera-overlay">
            <div className="camera-modal">
                <div className="camera-header">
                    <h3>📸 Capture Photo</h3>
                    <button className="btn btn-icon btn-ghost" onClick={handleClose}>
                        <HiX />
                    </button>
                </div>

                <div className="camera-container">
                    {!preview ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="camera-video"
                            />
                            <div className="camera-guide">
                                <div className="guide-frame"></div>
                                <p>Position person within frame</p>
                            </div>
                            <div className="camera-controls">
                                <button
                                    className="btn btn-icon btn-secondary camera-switch-btn"
                                    onClick={switchCamera}
                                    title="Switch Camera"
                                >
                                    <HiSwitchHorizontal />
                                </button>
                                <button
                                    className="capture-btn"
                                    onClick={capturePhoto}
                                    disabled={capturing}
                                    aria-label="Capture photo"
                                />
                                <div style={{ width: 48 }} />
                            </div>
                        </>
                    ) : (
                        <div className="preview-container">
                            <img
                                src={processedData?.blurredImage || preview}
                                alt="Preview"
                                className="preview-image"
                            />
                            {processing && (
                                <div className="processing-overlay">
                                    <div className="processing-card">
                                        <div className="ai-dots">
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                        </div>
                                        <div className="processing-text">
                                            <span className="processing-title">🤖 AI Processing</span>
                                            <span className="processing-step">{processingStep}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {preview && !processing && processedData && (
                    <div className="camera-actions">
                        {duplicateWarning && (
                            <div className="duplicate-warning">
                                <HiExclamation />
                                <span>{duplicateWarning.message}</span>
                            </div>
                        )}

                        <div className="ai-result-card">
                            <div className="ai-result-icon">
                                {processedData.isDuplicate ? '⚠️' : '✅'}
                            </div>
                            <div className="ai-result-info">
                                <span className="ai-result-title">
                                    {processedData.facesDetected} face(s) detected & blurred
                                </span>
                                <span className="ai-result-subtitle">
                                    {processedData.isDuplicate
                                        ? `Possible duplicate (${processedData.duplicateSimilarity}% similar)`
                                        : 'Verified as unique person'}
                                </span>
                            </div>
                        </div>

                        <div className="camera-action-buttons">
                            <button className="btn btn-secondary btn-lg" onClick={retakePhoto}>
                                Retake
                            </button>
                            <button
                                className={`btn ${processedData.isDuplicate ? 'btn-warning' : 'btn-primary'} btn-lg`}
                                onClick={confirmPhoto}
                            >
                                <HiCheck />
                                {processedData.isDuplicate ? 'Add Anyway' : 'Add to Batch'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .camera-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 0.5rem;
        }

        .camera-modal {
          background: var(--bg-secondary);
          border-radius: var(--radius-2xl);
          width: 100%;
          max-width: 640px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
        }

        .camera-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-elevated);
        }

        .camera-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .camera-container {
          position: relative;
          background: #000;
          aspect-ratio: 4/3;
        }

        .camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-guide {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .guide-frame {
          width: 70%;
          height: 70%;
          border: 2px dashed rgba(124, 58, 237, 0.5);
          border-radius: var(--radius-xl);
        }

        .camera-guide p {
          margin-top: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
        }

        .camera-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
        }

        .camera-switch-btn {
          width: 48px;
          height: 48px;
          font-size: 1.25rem;
        }

        .preview-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .processing-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .processing-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: var(--bg-elevated);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
        }

        .processing-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .processing-title {
          font-weight: 600;
          color: var(--text-primary);
        }

        .processing-step {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .camera-actions {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-elevated);
        }

        .duplicate-warning {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--warning-soft);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-lg);
          color: var(--warning);
          font-weight: 500;
        }

        .duplicate-warning svg {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .ai-result-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: var(--radius-lg);
        }

        .ai-result-icon {
          font-size: 2rem;
        }

        .ai-result-info {
          display: flex;
          flex-direction: column;
        }

        .ai-result-title {
          font-weight: 600;
          color: var(--text-primary);
        }

        .ai-result-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .camera-action-buttons {
          display: flex;
          gap: 1rem;
        }

        .camera-action-buttons .btn {
          flex: 1;
        }

        .btn-warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        @media (max-width: 480px) {
          .camera-modal {
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            border-radius: 0;
          }
          
          .camera-container {
            aspect-ratio: auto;
            flex: 1;
          }
          
          .processing-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
        </div>
    );
};

export default CameraCapture;
