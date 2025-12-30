const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   GET /api/auth/check-admin
// @desc    Check if admin exists (for first-time setup)
// @access  Public
router.get('/check-admin', async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        res.json({
            success: true,
            exists: !!adminExists
        });
    } catch (error) {
        res.json({
            success: true,
            exists: false
        });
    }
});

// @route   POST /api/auth/register
// @desc    Register first admin (only works if no admin exists)
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if any admin exists
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'Admin already exists. Contact existing admin for access.'
            });
        }

        // Create first admin
        const user = await User.create({
            email,
            password,
            name,
            role: 'admin'
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user (all roles)
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
    res.json({
        success: true,
        user: req.user.getPublicProfile()
    });
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email for login or verification
// @access  Public
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (upsert or create new)
        await OTP.findOneAndUpdate(
            { email },
            { email, otp, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send Email
        const message = `Your OTP for PromoSecure is: ${otp}\n\nThis code expires in 5 minutes.`;

        try {
            await sendEmail({
                email,
                subject: 'PromoSecure OTP Verification',
                message,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h1>Your One-Time Password</h1>
                        <p style="font-size: 16px;">Use the code below to complete your verification or login:</p>
                        <h2 style="background: #f4f4f4; padding: 10px 20px; display: inline-block; letter-spacing: 5px;">${otp}</h2>
                        <p style="color: #666; font-size: 14px;">This code expires in 5 minutes.</p>
                    </div>
                `
            });

            res.json({
                success: true,
                message: 'OTP sent successfully'
            });
        } catch (emailError) {
            console.error('Email send failed:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP (Generic)
// @access  Public
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        const validOtp = await OTP.findOne({ email, otp });

        if (!validOtp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Delete used OTP
        await OTP.deleteOne({ _id: validOtp._id });

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login-otp
// @desc    Login using OTP
// @access  Public
router.post('/login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Verify OTP first
        const validOtp = await OTP.findOne({ email, otp });

        if (!validOtp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please contact your manager.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Delete used OTP
        await OTP.deleteOne({ _id: validOtp._id });

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
