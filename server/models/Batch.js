const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Batch title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    gpsCoordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
        accuracy: { type: Number, default: null }
    },
    deviceInfo: {
        type: String,
        default: ''
    },
    promoter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft'
    },
    photoCount: {
        type: Number,
        default: 0
    },
    // AI verification summary
    aiSummary: {
        uniquePeopleCount: {
            type: Number,
            default: 0
        },
        totalFacesDetected: {
            type: Number,
            default: 0
        },
        duplicatesFound: {
            type: Number,
            default: 0
        },
        verificationScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        lastVerifiedAt: {
            type: Date,
            default: null
        }
    },
    submittedAt: {
        type: Date,
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    reviewNote: {
        type: String,
        default: ''
    },
    // Super Admin Force-Override Audit Trail
    adminOverride: {
        isOverridden: {
            type: Boolean,
            default: false
        },
        action: {
            type: String,
            enum: ['approved', 'rejected', 'reset'],
            default: null
        },
        note: {
            type: String,
            default: ''
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        adminName: {
            type: String,
            default: ''
        },
        overriddenAt: {
            type: Date,
            default: null
        }
    },
    complianceCertificateId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Fast compound query indexes for sub-millisecond querying
batchSchema.index({ promoter: 1, status: 1, createdAt: -1 });
batchSchema.index({ manager: 1, status: 1, createdAt: -1 });
batchSchema.index({ status: 1, createdAt: -1 });
batchSchema.index({ client: 1, createdAt: -1 });
batchSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Batch', batchSchema);
