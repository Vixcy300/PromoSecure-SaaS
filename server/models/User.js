const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'promoter', 'client'],
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // For managers: how many promoters they can create
    promoterLimit: {
        type: Number,
        default: 5
    },
    // For managers: count of promoters created
    promotersCreated: {
        type: Number,
        default: 0
    },
    // Company & Enterprise Profile (for managers)
    companyName: {
        type: String,
        trim: true,
        default: ''
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    taxId: {
        type: String,
        trim: true,
        default: ''
    },
    licenseTier: {
        type: String,
        enum: ['starter', 'pro', 'enterprise'],
        default: 'pro'
    },
    aiScanQuota: {
        type: Number,
        default: 1000 // Scans per month
    },
    storageQuotaMB: {
        type: Number,
        default: 5120 // 5 GB
    },
    adminNotes: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // For client portal users: reference to the Client profile they belong to
    linkedClient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get user's full info for JWT / responses
userSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role,
        companyName: this.companyName,
        phone: this.phone,
        address: this.address,
        taxId: this.taxId,
        licenseTier: this.licenseTier || 'pro',
        promoterLimit: this.promoterLimit,
        promotersCreated: this.promotersCreated,
        aiScanQuota: this.aiScanQuota || 1000,
        storageQuotaMB: this.storageQuotaMB || 5120,
        adminNotes: this.adminNotes || '',
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        createdBy: this.createdBy,
        createdAt: this.createdAt
    };
};

// High-performance database indexing for instant query resolution
userSchema.index({ role: 1, createdBy: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdBy: 1 });
userSchema.index({ role: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
