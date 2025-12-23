const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    // Original image stored as Base64 (only visible to promoter during capture)
    originalImage: {
        type: String,
        required: true
    },
    // Blurred image stored as Base64 (visible to manager)
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
        }
    },
    // GPS location data
    location: {
        latitude: {
            type: Number,
            default: null
        },
        longitude: {
            type: Number,
            default: null
        },
        accuracy: {
            type: Number,
            default: null
        },
        address: {
            type: String,
            default: ''
        }
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
