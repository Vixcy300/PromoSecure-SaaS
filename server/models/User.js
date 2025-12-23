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
        enum: ['admin', 'manager', 'promoter'],
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
        default: 0
    },
    // For managers: count of promoters created
    promotersCreated: {
        type: Number,
        default: 0
    },
    // Company name (for managers)
    companyName: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get user's full info for JWT
userSchema.methods.getPublicProfile = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role,
        companyName: this.companyName,
        promoterLimit: this.promoterLimit,
        promotersCreated: this.promotersCreated,
        createdBy: this.createdBy
    };
};

module.exports = mongoose.model('User', userSchema);
