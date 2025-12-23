const express = require('express');
const Photo = require('../models/Photo');
const Batch = require('../models/Batch');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/photos
// @desc    Add photo to batch
// @access  Promoter only
router.post('/', authorize('promoter'), async (req, res) => {
    try {
        const { batchId, originalImage, blurredImage, aiMetadata, location } = req.body;

        // Verify batch exists and belongs to promoter
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        if (batch.promoter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (batch.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot add photos to submitted batch'
            });
        }

        // Enhanced duplicate detection with similarity comparison
        let isUnique = true;
        let similarToPhotoId = null;
        let highestSimilarity = 0;
        const DUPLICATE_THRESHOLD = 80; // 80% similarity = duplicate

        const existingPhotos = await Photo.find({ batch: batchId });

        if (aiMetadata?.imageHash && existingPhotos.length > 0) {
            for (const photo of existingPhotos) {
                if (photo.aiMetadata?.imageHash) {
                    // Compare image hashes using hamming distance
                    const similarity = compareHashes(aiMetadata.imageHash, photo.aiMetadata.imageHash);
                    if (similarity > highestSimilarity) {
                        highestSimilarity = similarity;
                    }
                    if (similarity >= DUPLICATE_THRESHOLD) {
                        isUnique = false;
                        similarToPhotoId = photo._id;
                        break;
                    }
                }
            }
        }

        // Also check face signature similarity
        if (isUnique && aiMetadata?.faceSignature && existingPhotos.length > 0) {
            for (const photo of existingPhotos) {
                if (photo.aiMetadata?.faceSignature) {
                    const faceSimilarity = compareFaceSignatures(aiMetadata.faceSignature, photo.aiMetadata.faceSignature);
                    if (faceSimilarity >= DUPLICATE_THRESHOLD) {
                        isUnique = false;
                        similarToPhotoId = photo._id;
                        highestSimilarity = Math.max(highestSimilarity, faceSimilarity);
                        break;
                    }
                }
            }
        }

        const photo = await Photo.create({
            batch: batchId,
            originalImage,
            blurredImage,
            location: location || null,
            aiMetadata: {
                ...aiMetadata,
                isUnique,
                similarToPhotoId,
                similarityScore: highestSimilarity
            }
        });

        // Update batch photo count
        await Batch.findByIdAndUpdate(batchId, {
            $inc: { photoCount: 1 }
        });

        res.status(201).json({
            success: true,
            photo: {
                _id: photo._id,
                blurredImage: photo.blurredImage,
                aiMetadata: photo.aiMetadata,
                location: photo.location,
                capturedAt: photo.capturedAt
            },
            duplicateWarning: !isUnique ? {
                isDuplicate: true,
                similarityScore: highestSimilarity,
                similarToPhotoId
            } : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Helper: Compare two image hashes and return similarity percentage
function compareHashes(hash1, hash2) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return 0;
    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] === hash2[i]) matches++;
    }
    return Math.round((matches / hash1.length) * 100);
}

// Helper: Compare face signatures and return similarity percentage  
function compareFaceSignatures(sig1, sig2) {
    if (!sig1 || !sig2) return 0;

    // Face signature format: "NNxMM_NN:NN:NN:NN_NNxNN" (widthxheight_keypoints_positionxposition)
    const parts1 = sig1.split('_');
    const parts2 = sig2.split('_');

    if (parts1.length < 2 || parts2.length < 2) return 0;

    // Compare proportions
    const [w1, h1] = parts1[0].split('x').map(Number);
    const [w2, h2] = parts2[0].split('x').map(Number);

    const ratio1 = w1 / h1;
    const ratio2 = w2 / h2;

    const ratioSimilarity = 1 - Math.abs(ratio1 - ratio2) / Math.max(ratio1, ratio2);

    // Compare keypoints if available
    let keypointSimilarity = 0.5;
    if (parts1[1] && parts2[1]) {
        const kp1 = parts1[1].split(':').map(Number);
        const kp2 = parts2[1].split(':').map(Number);
        if (kp1.length === kp2.length && kp1.length > 0) {
            let diff = 0;
            for (let i = 0; i < kp1.length; i++) {
                diff += Math.abs(kp1[i] - kp2[i]);
            }
            keypointSimilarity = Math.max(0, 1 - (diff / (kp1.length * 50)));
        }
    }

    return Math.round((ratioSimilarity * 0.4 + keypointSimilarity * 0.6) * 100);
}

// @route   DELETE /api/photos/all
// @desc    Delete ALL photos from database (Admin only)
// @access  Admin only
// NOTE: This route MUST be defined BEFORE /:batchId to avoid "all" being treated as a batchId
router.delete('/all', authorize('admin'), async (req, res) => {
    try {
        // Count photos before deletion
        const photoCount = await Photo.countDocuments();

        // Delete all photos
        await Photo.deleteMany({});

        // Reset all batch photo counts to 0
        await Batch.updateMany({}, { $set: { photoCount: 0 } });

        res.json({
            success: true,
            message: `Deleted ${photoCount} photos from all batches`,
            deletedCount: photoCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/photos/:batchId
// @desc    Get photos for a batch
// @access  Owner/Manager/Admin
router.get('/:batchId', async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.batchId);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check access
        const isOwner = batch.promoter.toString() === req.user._id.toString();
        const isManager = req.user.role === 'manager' && batch.manager.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isManager && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Promoter sees original, others see blurred
        let selectFields = 'blurredImage aiMetadata capturedAt';
        if (isOwner) {
            selectFields = 'originalImage blurredImage aiMetadata capturedAt';
        }

        const photos = await Photo.find({ batch: req.params.batchId })
            .select(selectFields)
            .sort({ capturedAt: -1 });

        res.json({
            success: true,
            count: photos.length,
            photos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/photos/:id
// @desc    Delete photo from batch
// @access  Promoter (owner, draft batch only)
router.delete('/:id', authorize('promoter'), async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: 'Photo not found'
            });
        }

        const batch = await Batch.findById(photo.batch);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        if (batch.promoter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (batch.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete photos from submitted batch'
            });
        }

        await photo.deleteOne();

        // Update batch photo count
        await Batch.findByIdAndUpdate(batch._id, {
            $inc: { photoCount: -1 }
        });

        res.json({
            success: true,
            message: 'Photo deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
