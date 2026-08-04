/**
 * Non-blocking Brand & Promotional Object Recognition
 * Uses COCO-SSD with fail-safe timeout
 */

let model = null;
let isLoading = false;

export const initBrandModel = async () => {
    if (model) return model;
    if (isLoading) return null;

    try {
        isLoading = true;
        const tf = await import('@tensorflow/tfjs');
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        await tf.ready();
        model = await cocoSsd.load({ base: 'mobilenet_v2' });
        isLoading = false;
        return model;
    } catch (error) {
        console.warn('Brand recognition model unavailable (offline or disabled):', error.message);
        isLoading = false;
        return null;
    }
};

export const detectPromotionalItems = async (imageElement) => {
    try {
        // Fast race with 600ms timeout so camera is never blocked
        const detectionPromise = (async () => {
            const net = await initBrandModel();
            if (!net) return [];
            const predictions = await net.detect(imageElement);
            // Filter out 'person' since faces are handled separately
            return predictions
                .filter(pred => pred.class !== 'person' && pred.score > 0.45)
                .map(p => ({
                    label: p.class,
                    confidence: Math.round(p.score * 100),
                }));
        })();

        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve([]), 700));
        const detectedObjects = await Promise.race([detectionPromise, timeoutPromise]);

        return {
            success: true,
            detectedObjects: detectedObjects || [],
        };
    } catch (error) {
        return { success: false, detectedObjects: [] };
    }
};
