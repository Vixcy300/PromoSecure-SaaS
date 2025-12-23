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
    // Optional client/brand link
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
    }
}, {
    timestamps: true
});

// Index for faster queries
batchSchema.index({ promoter: 1, status: 1 });
batchSchema.index({ manager: 1, status: 1 });

module.exports = mongoose.model('Batch', batchSchema);
