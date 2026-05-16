import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let model = null;

export const initBrandModel = async () => {
    if (!model) {
        await tf.ready();
        model = await cocoSsd.load();
    }
    return model;
};

export const detectPromotionalItems = async (imageElement) => {
    try {
        const net = await initBrandModel();
        const predictions = await net.detect(imageElement);
        
        // Filter out "person" because we already detect faces.
        // We are looking for objects that represent the "brand" or "product"
        // e.g., "bottle", "cup", "laptop", "cell phone", "book"
        const objectsOnly = predictions.filter(pred => pred.class !== 'person');
        
        return {
            success: true,
            detectedObjects: objectsOnly.map(p => ({
                label: p.class,
                confidence: Math.round(p.score * 100)
            }))
        };
    } catch (error) {
        console.error('Brand Recognition Error:', error);
        return { success: false, error: error.message };
    }
};
