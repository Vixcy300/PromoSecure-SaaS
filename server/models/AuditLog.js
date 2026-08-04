const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ['security', 'billing', 'audit', 'system', 'user', 'compliance'],
        default: 'audit',
        index: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    performedByName: {
        type: String,
        default: 'System Super Admin'
    },
    performedByEmail: {
        type: String,
        default: 'admin@promosecure.io'
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    targetType: {
        type: String,
        default: 'Entity'
    },
    targetName: {
        type: String,
        default: ''
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        default: '127.0.0.1'
    },
    userAgent: {
        type: String,
        default: 'PromoSecure Enterprise Client'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for lightning fast audit trail searches
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
