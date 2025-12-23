/**
 * Face Blurring Utility v2.0
 * Targeted blur with moderate intensity - only blurs face area
 */

// Blur configuration - targeted to face only
const BLUR_CONFIG = {
    pixelSize: 14,          // Moderate pixels
    blurPasses: 3,          // Fewer passes
    paddingPercent: 15,     // Less padding - just face area
    overlayOpacity: 0.08,   // Subtle overlay
};

export const blurFaces = (canvas, faces, config = BLUR_CONFIG) => {
    const ctx = canvas.getContext('2d');

    if (!faces || faces.length === 0) {
        console.log('No faces to blur');
        return canvas.toDataURL('image/jpeg', 0.85);
    }

    faces.forEach(face => {
        // Add LARGE padding to face box for better coverage
        const paddingX = face.width * (config.paddingPercent / 100);
        const paddingY = face.height * (config.paddingPercent / 100);

        const x = Math.max(0, Math.floor(face.x - paddingX));
        const y = Math.max(0, Math.floor(face.y - paddingY));
        const width = Math.min(canvas.width - x, Math.ceil(face.width + paddingX * 2));
        const height = Math.min(canvas.height - y, Math.ceil(face.height + paddingY * 2));

        // Layer 1: Heavy pixelation
        applyHeavyPixelation(ctx, x, y, width, height, config.pixelSize);

        // Layer 2: Multiple blur passes
        for (let i = 0; i < config.blurPasses; i++) {
            applyGaussianBlur(ctx, x, y, width, height, 4);
        }

        // Layer 3: Add color noise overlay
        applyNoiseOverlay(ctx, x, y, width, height, config.overlayOpacity);

        // Layer 4: Final pixelation for extra security
        applyHeavyPixelation(ctx, x, y, width, height, Math.floor(config.pixelSize / 2));
    });

    return canvas.toDataURL('image/jpeg', 0.85);
};

const applyHeavyPixelation = (ctx, x, y, width, height, pixelSize) => {
    if (width <= 0 || height <= 0) return;

    const regionData = ctx.getImageData(x, y, width, height);
    const data = regionData.data;

    const blocksX = Math.ceil(width / pixelSize);
    const blocksY = Math.ceil(height / pixelSize);

    for (let blockY = 0; blockY < blocksY; blockY++) {
        for (let blockX = 0; blockX < blocksX; blockX++) {
            const startX = blockX * pixelSize;
            const startY = blockY * pixelSize;
            const endX = Math.min(startX + pixelSize, width);
            const endY = Math.min(startY + pixelSize, height);

            // Calculate average color for this block
            let r = 0, g = 0, b = 0, count = 0;

            for (let py = startY; py < endY; py++) {
                for (let px = startX; px < endX; px++) {
                    const i = (py * width + px) * 4;
                    if (i < data.length - 3) {
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        count++;
                    }
                }
            }

            if (count === 0) continue;

            r = Math.round(r / count);
            g = Math.round(g / count);
            b = Math.round(b / count);

            // Apply average color to all pixels in block
            for (let py = startY; py < endY; py++) {
                for (let px = startX; px < endX; px++) {
                    const i = (py * width + px) * 4;
                    if (i < data.length - 3) {
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                    }
                }
            }
        }
    }

    ctx.putImageData(regionData, x, y);
};

const applyGaussianBlur = (ctx, x, y, width, height, radius) => {
    if (width <= 0 || height <= 0) return;

    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    const kernel = createGaussianKernel(radius);
    const kernelSum = kernel.reduce((a, b) => a + b, 0);

    // Horizontal pass
    for (let py = 0; py < height; py++) {
        for (let px = radius; px < width - radius; px++) {
            let r = 0, g = 0, b = 0;

            for (let k = -radius; k <= radius; k++) {
                const idx = (py * width + px + k) * 4;
                const weight = kernel[k + radius];
                r += copy[idx] * weight;
                g += copy[idx + 1] * weight;
                b += copy[idx + 2] * weight;
            }

            const i = (py * width + px) * 4;
            data[i] = Math.round(r / kernelSum);
            data[i + 1] = Math.round(g / kernelSum);
            data[i + 2] = Math.round(b / kernelSum);
        }
    }

    // Copy for vertical pass
    const temp = new Uint8ClampedArray(data);

    // Vertical pass
    for (let py = radius; py < height - radius; py++) {
        for (let px = 0; px < width; px++) {
            let r = 0, g = 0, b = 0;

            for (let k = -radius; k <= radius; k++) {
                const idx = ((py + k) * width + px) * 4;
                const weight = kernel[k + radius];
                r += temp[idx] * weight;
                g += temp[idx + 1] * weight;
                b += temp[idx + 2] * weight;
            }

            const i = (py * width + px) * 4;
            data[i] = Math.round(r / kernelSum);
            data[i + 1] = Math.round(g / kernelSum);
            data[i + 2] = Math.round(b / kernelSum);
        }
    }

    ctx.putImageData(imageData, x, y);
};

const createGaussianKernel = (radius) => {
    const kernel = [];
    const sigma = radius / 2;
    let sum = 0;

    for (let i = -radius; i <= radius; i++) {
        const value = Math.exp(-(i * i) / (2 * sigma * sigma));
        kernel.push(value);
        sum += value;
    }

    // Normalize
    return kernel.map(v => v / sum * sum);
};

const applyNoiseOverlay = (ctx, x, y, width, height, opacity) => {
    if (width <= 0 || height <= 0) return;

    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Add slight color shift for additional privacy
        const noise = (Math.random() - 0.5) * 30;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, x, y);
};

export const processImage = async (imageDataUrl, detectFacesFn) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Detect faces
                const faces = await detectFacesFn(img);

                // Create heavily blurred version
                const blurredImage = blurFaces(canvas, faces);

                resolve({
                    originalImage: imageDataUrl,
                    blurredImage,
                    faces,
                    facesDetected: faces.length,
                });
            } catch (error) {
                reject(error);
            }
        };
        img.onerror = reject;
        img.src = imageDataUrl;
    });
};

/**
 * Generate a perceptual hash of an image for duplicate detection
 * Uses average hash algorithm
 */
export const generateImageHash = (imageDataUrl) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 16; // 16x16 for good accuracy
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Draw resized grayscale
            ctx.filter = 'grayscale(100%)';
            ctx.drawImage(img, 0, 0, size, size);

            const imageData = ctx.getImageData(0, 0, size, size);
            const data = imageData.data;

            // Calculate average brightness
            let sum = 0;
            const pixels = [];
            for (let i = 0; i < data.length; i += 4) {
                const brightness = data[i]; // Already grayscale
                pixels.push(brightness);
                sum += brightness;
            }
            const avg = sum / pixels.length;

            // Generate hash based on whether each pixel is above/below average
            let hash = '';
            for (const pixel of pixels) {
                hash += pixel > avg ? '1' : '0';
            }

            resolve(hash);
        };
        img.onerror = () => resolve('');
        img.src = imageDataUrl;
    });
};

/**
 * Compare two image hashes and return similarity percentage
 */
export const compareImageHashes = (hash1, hash2) => {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;

    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] === hash2[i]) matches++;
    }

    return Math.round((matches / hash1.length) * 100);
};
