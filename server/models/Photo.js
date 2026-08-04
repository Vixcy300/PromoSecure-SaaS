const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    // PRIVACY ENFORCEMENT: Never select originalImage by default (Schema-level block)
    originalImage: {
        type: String,
        required: false,
        select: false
    },
    // Blurred image stored as Base64 (GDPR-compliant anonymized asset)
    blurredImage: {
        type: String,
        required: true
    },
    // AI detection metadata
    aiMetadata: {
        facesDetected: {
            type: Number,
            default: 0
        },
        faceLocations: [{
            x: Number,
            y: Number,
            width: Number,
            height: Number
        }],
        // Face embedding for uniqueness comparison (simplified hash)
        faceSignature: {
            type: String,
            default: ''
        },
        // Image perceptual hash for duplicate detection
        imageHash: {
            type: String,
            default: ''
        },
        isUnique: {
            type: Boolean,
            default: true
        },
        similarToPhotoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Photo',
            default: null
        },
        similarityScore: {
            type: Number,
            default: 0
        },
        confidence: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        cryptographicSignature: {
            type: String,
            default: ''
        },
        detectedObjects: [{
            label: String,
            confidence: Number
        }]
    },
    // Zero-Knowledge Geofencing Proof (instead of exact coordinates)
    zoneProof: {
        type: String,
        default: ''
    },
    capturedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for batch queries
photoSchema.index({ batch: 1 });

module.exports = mongoose.model('Photo', photoSchema);
