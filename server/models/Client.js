const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
        maxLength: 100
    },
    logo: {
        type: String,
        default: '' // Base64 or URL
    },
    contactPerson: {
        type: String,
        default: '',
        trim: true
    },
    contactEmail: {
        type: String,
        default: '',
        lowercase: true,
        trim: true
    },
    contactPhone: {
        type: String,
        default: '',
        trim: true
    },
    industry: {
        type: String,
        default: '',
        trim: true
    },
    notes: {
        type: String,
        default: ''
    },
    // Manager who created/owns this client
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for manager's clients
clientSchema.index({ manager: 1 });
clientSchema.index({ name: 'text' });

module.exports = mongoose.model('Client', clientSchema);
