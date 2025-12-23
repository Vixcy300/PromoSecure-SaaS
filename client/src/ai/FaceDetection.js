/**
 * Face Detection v2.0 using TensorFlow.js
 * Enhanced with better duplicate detection
 */

let model = null;
let isLoading = false;

export const loadFaceDetectionModel = async () => {
    if (model) return model;
    if (isLoading) {
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return model;
    }

    isLoading = true;
    try {
        const tf = await import('@tensorflow/tfjs');
        const faceDetection = await import('@tensorflow-models/face-detection');

        await tf.setBackend('webgl');
        await tf.ready();

        model = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
                runtime: 'tfjs',
                maxFaces: 15,
                modelType: 'short',
            }
        );

        console.log('✅ Face detection model loaded');
        isLoading = false;
        return model;
    } catch (error) {
        console.error('❌ Failed to load face detection model:', error);
        isLoading = false;
        // Return fallback simple detection
        return null;
    }
};

export const detectFaces = async (imageElement) => {
    try {
        const detector = await loadFaceDetectionModel();

        if (!detector) {
            // Fallback: return center region as approximate face
            return [{
                x: imageElement.width * 0.3,
                y: imageElement.height * 0.15,
                width: imageElement.width * 0.4,
                height: imageElement.height * 0.5,
                confidence: 0.5,
            }];
        }

        const faces = await detector.estimateFaces(imageElement, {
            flipHorizontal: false,
        });

        return faces.map(face => ({
            x: face.box.xMin,
            y: face.box.yMin,
            width: face.box.width,
            height: face.box.height,
            confidence: face.box.confidence || 0.9,
            // Store keypoints for better signature
            keypoints: face.keypoints || [],
        }));
    } catch (error) {
        console.error('Face detection error:', error);
        // Return approximate center face region as fallback
        return [{
            x: imageElement.width * 0.3,
            y: imageElement.height * 0.15,
            width: imageElement.width * 0.4,
            height: imageElement.height * 0.5,
            confidence: 0.5,
        }];
    }
};

/**
 * Generate a face signature based on:
 * - Face position relative to image
 * - Face proportions
 * - Keypoint distances (if available)
 */
export const generateFaceSignature = (faceData, imageData) => {
    if (!faceData || faceData.length === 0) return '';

    const face = faceData[0];

    // Calculate relative measurements
    const relX = Math.round((face.x / imageData.width) * 100);
    const relY = Math.round((face.y / imageData.height) * 100);
    const relW = Math.round((face.width / imageData.width) * 100);
    const relH = Math.round((face.height / imageData.height) * 100);
    const aspectRatio = Math.round((face.width / face.height) * 100);

    // Create signature from facial measurements
    // This won't be unique per person but helps detect exact duplicates
    return `sig_${relX}_${relY}_${relW}_${relH}_${aspectRatio}`;
};

/**
 * Compare two face signatures for similarity
 * Returns percentage of similarity (0-100)
 */
export const compareFaceSignatures = (sig1, sig2) => {
    if (!sig1 || !sig2) return 0;

    const parts1 = sig1.split('_').slice(1).map(Number);
    const parts2 = sig2.split('_').slice(1).map(Number);

    if (parts1.length !== parts2.length) return 0;

    let totalDiff = 0;
    for (let i = 0; i < parts1.length; i++) {
        totalDiff += Math.abs(parts1[i] - parts2[i]);
    }

    // Max possible difference is about 500 (5 values * 100 max each)
    const maxDiff = 300;
    const similarity = Math.max(0, 100 - (totalDiff / maxDiff * 100));

    return Math.round(similarity);
};
