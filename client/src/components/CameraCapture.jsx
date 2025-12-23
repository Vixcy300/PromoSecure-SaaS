import { useState, useRef, useEffect } from 'react';
import { HiSwitchHorizontal, HiX, HiCheck, HiExclamation, HiRefresh } from 'react-icons/hi';
import { detectFaces, generateFaceSignature, compareFaceSignatures } from '../ai/FaceDetection';
import { processImage, generateImageHash, compareImageHashes } from '../ai/FaceBlur';
import toast from 'react-hot-toast';

const CameraCapture = ({ onCapture, onClose, existingPhotos = [] }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [facingMode, setFacingMode] = useState('environment');
    const [capturing, setCapturing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [preview, setPreview] = useState(null);
    const [processedData, setProcessedData] = useState(null);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [location, setLocation] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);

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
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, []);

    // Stop camera stream completely
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
    };

    // Start camera with specified mode
    const startCamera = async (mode) => {
        try {
            setCameraError(null);
            setCameraReady(false);

            // Always stop existing stream first
            stopCamera();

            // Small delay to ensure previous stream is fully released
            await new Promise(r => setTimeout(r, 100));

            // Reduced resolution for faster processing
            const constraints = {
                video: {
                    facingMode: { ideal: mode },
                    width: { ideal: 800 },
                    height: { ideal: 600 },
                },
                audio: false,
            };

            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = newStream;

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;

                // Wait for video to be ready
                await new Promise((resolve, reject) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play()
                            .then(resolve)
                            .catch(reject);
                    };
                    setTimeout(reject, 5000); // Timeout after 5s
                });

                setCameraReady(true);
            }
        } catch (error) {
            console.error('Camera error:', error);
            setCameraError(error.message || 'Failed to access camera');
            toast.error('Camera access failed. Please check permissions.');
        }
    };

    // Initialize camera on mount
    useEffect(() => {
        startCamera('environment');

        return () => {
            stopCamera();
        };
    }, []);

    // Switch between front and back camera
    const switchCamera = async () => {
        const newMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newMode);
        stopCamera();
        await new Promise(r => setTimeout(r, 300));
        await startCamera(newMode);
    };

    // Capture photo from video
    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current || !cameraReady) return;

        setCapturing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Limit canvas size for faster processing (max 800px)
        const maxSize = 800;
        const scale = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight, 1);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Lower quality for faster upload (0.6 = good balance)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPreview(imageDataUrl);
        setCapturing(false);

        // Stop camera while processing to free resources
        stopCamera();

        await processWithAI(imageDataUrl);
    };

    const processWithAI = async (imageDataUrl) => {
        setProcessing(true);
        setDuplicateWarning(null);

        try {
            setProcessingStep('Detecting faces...');
            const result = await processImage(imageDataUrl, detectFaces);

            if (result.facesDetected === 0) {
                toast.error('No faces detected. Please retake.');
                setPreview(null);
                setProcessing(false);
                // Restart camera for retake
                await startCamera(facingMode);
                return;
            }

            setProcessingStep('Checking for duplicates...');
            const imageHash = await generateImageHash(imageDataUrl);

            const faceSignature = generateFaceSignature(result.faces, {
                width: canvasRef.current.width,
                height: canvasRef.current.height,
            });

            // INCREASED THRESHOLDS to reduce false positives
            // Only flag as duplicate if VERY similar (95%+ image, 92%+ face)
            let isDuplicate = false;
            let duplicateSimilarity = 0;

            for (const photo of existingPhotos) {
                // Check image hash - needs to be 95%+ similar
                if (photo.imageHash) {
                    const hashSimilarity = compareImageHashes(imageHash, photo.imageHash);
                    if (hashSimilarity > 95) {
                        isDuplicate = true;
                        duplicateSimilarity = hashSimilarity;
                        break;
                    }
                }

                // Check face signature - needs to be 92%+ similar
                if (photo.aiMetadata?.faceSignature) {
                    const sigSimilarity = compareFaceSignatures(faceSignature, photo.aiMetadata.faceSignature);
                    if (sigSimilarity > 92) {
                        isDuplicate = true;
                        duplicateSimilarity = sigSimilarity;
                        break;
                    }
                }
            }

            setProcessingStep('Blurring faces...');
            await new Promise(r => setTimeout(r, 200));

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
                    message: `⚠️ ${duplicateSimilarity}% similar to existing photo!`,
                });
                toast.error(`Possible duplicate (${duplicateSimilarity}% similar)`);
            } else {
                toast.success(`${result.facesDetected} face(s) detected & blurred!`);
            }
        } catch (error) {
            console.error('Processing error:', error);
            toast.error('Processing failed. Please retry.');
            setPreview(null);
            // Restart camera on error
            await startCamera(facingMode);
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

    const retakePhoto = async () => {
        setPreview(null);
        setProcessedData(null);
        setDuplicateWarning(null);
        // Restart camera for retake
        await startCamera(facingMode);
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <div className="camera-fullscreen">
            {/* Header */}
            <div className="camera-top-bar">
                <button className="camera-close-btn" onClick={handleClose}>
                    <HiX size={24} />
                </button>
                <span className="camera-title">📸 Capture Photo</span>
                <div style={{ width: 44 }} />
            </div>

            {/* Camera View */}
            <div className="camera-viewport">
                {!preview ? (
                    <>
                        {cameraError ? (
                            <div className="camera-error">
                                <HiExclamation size={48} />
                                <p>Cannot access camera</p>
                                <span>{cameraError}</span>
                                <button className="btn btn-primary" onClick={() => startCamera(facingMode)}>
                                    <HiRefresh /> Retry
                                </button>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`camera-video-full ${facingMode === 'user' ? 'mirror' : ''}`}
                            />
                        )}
                        <div className="camera-overlay-guide">
                            <div className="guide-corners">
                                <div className="corner tl" />
                                <div className="corner tr" />
                                <div className="corner bl" />
                                <div className="corner br" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="preview-full">
                        <img
                            src={processedData?.blurredImage || preview}
                            alt="Preview"
                            className="preview-img-full"
                        />
                        {processing && (
                            <div className="processing-full">
                                <div className="processing-spinner" />
                                <span className="processing-label">🤖 {processingStep}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="camera-bottom-bar">
                {!preview ? (
                    <div className="capture-controls">
                        <button
                            className="switch-cam-btn"
                            onClick={switchCamera}
                            disabled={cameraError || !cameraReady}
                        >
                            <HiSwitchHorizontal size={22} />
                        </button>
                        <button
                            className="shutter-btn"
                            onClick={capturePhoto}
                            disabled={capturing || cameraError || !cameraReady}
                        >
                            <div className="shutter-inner" />
                        </button>
                        <div style={{ width: 52 }} />
                    </div>
                ) : processing ? (
                    <div className="processing-status">
                        <div className="ai-pulse" />
                        <span>Processing photo...</span>
                    </div>
                ) : processedData ? (
                    <div className="confirm-controls">
                        {duplicateWarning && (
                            <div className="dup-warning-bar">
                                <HiExclamation />
                                <span>{duplicateWarning.message}</span>
                            </div>
                        )}
                        <div className="result-summary">
                            <span className={processedData.isDuplicate ? 'warn' : 'ok'}>
                                {processedData.isDuplicate ? '⚠️' : '✅'} {processedData.facesDetected} face(s) detected & blurred
                            </span>
                        </div>
                        <div className="action-btns">
                            <button className="btn-action secondary" onClick={retakePhoto}>
                                Retake
                            </button>
                            <button
                                className={`btn-action primary ${processedData.isDuplicate ? 'warning' : ''}`}
                                onClick={confirmPhoto}
                            >
                                <HiCheck size={20} />
                                {processedData.isDuplicate ? 'Add Anyway' : 'Add Photo'}
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <style>{`
                .camera-fullscreen {
                    position: fixed;
                    inset: 0;
                    background: #000;
                    display: flex;
                    flex-direction: column;
                    z-index: 9999;
                }

                .camera-top-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    padding-top: max(12px, env(safe-area-inset-top));
                    background: rgba(0,0,0,0.8);
                    position: relative;
                    z-index: 10;
                }

                .camera-close-btn {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    cursor: pointer;
                }

                .camera-title {
                    color: #fff;
                    font-weight: 600;
                    font-size: 16px;
                }

                .camera-viewport {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .camera-video-full {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .camera-video-full.mirror {
                    transform: scaleX(-1);
                }

                .camera-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: #fff;
                    text-align: center;
                    padding: 24px;
                }

                .camera-error p {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                }

                .camera-error span {
                    font-size: 14px;
                    opacity: 0.7;
                }

                .camera-overlay-guide {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .guide-corners {
                    width: 70%;
                    max-width: 280px;
                    aspect-ratio: 3/4;
                    position: relative;
                }

                .corner {
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    border: 3px solid rgba(255,255,255,0.5);
                }

                .corner.tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
                .corner.tr { top: 0; right: 0; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
                .corner.bl { bottom: 0; left: 0; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
                .corner.br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 8px 0; }

                .preview-full {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .preview-img-full {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    background: #000;
                }

                .processing-full {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                }

                .processing-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid rgba(255,255,255,0.2);
                    border-top-color: #0d9488;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .processing-label {
                    color: #fff;
                    font-size: 16px;
                    font-weight: 500;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .camera-bottom-bar {
                    background: rgba(0,0,0,0.9);
                    padding: 20px 16px;
                    padding-bottom: max(20px, env(safe-area-inset-bottom));
                    position: relative;
                    z-index: 10;
                }

                .capture-controls {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 36px;
                }

                .switch-cam-btn {
                    width: 52px;
                    height: 52px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.15);
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .switch-cam-btn:active {
                    transform: scale(0.95);
                    background: rgba(255,255,255,0.25);
                }

                .switch-cam-btn:disabled {
                    opacity: 0.3;
                }

                .shutter-btn {
                    width: 76px;
                    height: 76px;
                    border-radius: 50%;
                    border: 4px solid #fff;
                    background: transparent;
                    padding: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .shutter-btn:active {
                    transform: scale(0.95);
                }

                .shutter-btn:disabled {
                    opacity: 0.5;
                }

                .shutter-inner {
                    width: 100%;
                    height: 100%;
                    background: #fff;
                    border-radius: 50%;
                }

                .processing-status {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 12px 0;
                    color: #fff;
                }

                .ai-pulse {
                    width: 12px;
                    height: 12px;
                    background: #0d9488;
                    border-radius: 50%;
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }

                .confirm-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .dup-warning-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(245, 158, 11, 0.2);
                    border: 1px solid rgba(245, 158, 11, 0.5);
                    border-radius: 8px;
                    color: #f59e0b;
                    font-size: 14px;
                    font-weight: 500;
                }

                .result-summary {
                    text-align: center;
                    padding: 8px 0;
                }

                .result-summary span {
                    font-size: 15px;
                    font-weight: 500;
                }

                .result-summary .ok { color: #10b981; }
                .result-summary .warn { color: #f59e0b; }

                .action-btns {
                    display: flex;
                    gap: 12px;
                }

                .btn-action {
                    flex: 1;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: none;
                    border-radius: 14px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-action:active {
                    transform: scale(0.98);
                }

                .btn-action.secondary {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .btn-action.primary {
                    background: linear-gradient(135deg, #0d9488, #14b8a6);
                    color: #fff;
                }

                .btn-action.primary.warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }
            `}</style>
        </div>
    );
};

export default CameraCapture;
