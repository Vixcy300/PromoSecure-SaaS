const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const { authLimiter } = require('../middleware/security');

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
// @desc    Register the ONLY admin account (requires INITIAL_SETUP_KEY)
// @access  Public — one-time use only
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { email, password, name, setupKey } = req.body;

        // STRICT: Only ONE admin can ever exist in the system
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount > 0) {
            return res.status(403).json({
                success: false,
                message: 'Platform already configured. Registration is disabled.'
            });
        }

        // Check Setup Key
        if (!process.env.INITIAL_SETUP_KEY || setupKey !== process.env.INITIAL_SETUP_KEY) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or missing initial setup key. Access denied.'
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
router.post('/login', authLimiter, async (req, res) => {
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
                message: 'Action Denied by Admin, Contact Admin'
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
router.post('/send-otp', authLimiter, async (req, res) => {
    try {
        const { email, type } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        // For login, check if user exists
        if (type === 'login') {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Email not registered. Please contact your administrator.'
                });
            }
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Action Denied by Admin, Contact Admin'
                });
            }
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
        const message = `Your OTP for PromoSecure is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request this, please contact the administrator immediately at vigneshigt@gmail.com`;

        const otpDigits = otp.split('').map(d => `<td style="width:44px;height:52px;background:#f0f4ff;border:2px solid #0066CC;border-radius:10px;text-align:center;font-size:26px;font-weight:800;color:#0066CC;font-family:'Segoe UI',Arial,sans-serif;">${d}</td>`).join('');
        const now = new Date();
        const timeStr = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

        try {
            await sendEmail({
                email,
                subject: `🔐 ${otp} — Your PromoSecure Verification Code`,
                message,
                html: `
                <div style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
                  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);margin-top:20px;margin-bottom:20px;">

                    <!-- Header -->
                    <div style="background:#0066CC;padding:28px 32px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">🔒 PromoSecure</h1>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:400;">Privacy-First Promotional Verification Platform</p>
                    </div>

                    <!-- Body -->
                    <div style="padding:32px 32px 24px;">
                      <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">Verification Code</h2>
                      <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.5;">
                        Use the code below to complete your sign-in. This code is valid for <strong style="color:#0066CC;">5 minutes</strong>.
                      </p>

                      <!-- OTP Code -->
                      <div style="text-align:center;margin:0 0 24px;">
                        <table cellpadding="0" cellspacing="6" style="margin:0 auto;">
                          <tr>${otpDigits}</tr>
                        </table>
                      </div>

                      <!-- Info Box -->
                      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:0 0 24px;">
                        <table cellpadding="0" cellspacing="0" style="width:100%;">
                          <tr>
                            <td style="padding:4px 0;color:#64748b;font-size:13px;width:110px;">📧 Sent to:</td>
                            <td style="padding:4px 0;color:#1e293b;font-size:13px;font-weight:600;">${email}</td>
                          </tr>
                          <tr>
                            <td style="padding:4px 0;color:#64748b;font-size:13px;">🕐 Generated:</td>
                            <td style="padding:4px 0;color:#1e293b;font-size:13px;font-weight:600;">${timeStr} IST</td>
                          </tr>
                          <tr>
                            <td style="padding:4px 0;color:#64748b;font-size:13px;">⏳ Expires in:</td>
                            <td style="padding:4px 0;color:#dc2626;font-size:13px;font-weight:600;">5 minutes</td>
                          </tr>
                          <tr>
                            <td style="padding:4px 0;color:#64748b;font-size:13px;">🔑 Purpose:</td>
                            <td style="padding:4px 0;color:#1e293b;font-size:13px;font-weight:600;">${type === 'login' ? 'Account Login' : 'Email Verification'}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- Security Warning -->
                      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin:0 0 20px;">
                        <p style="margin:0;color:#991b1b;font-size:13px;font-weight:600;">⚠️ Security Notice</p>
                        <p style="margin:6px 0 0;color:#b91c1c;font-size:12px;line-height:1.5;">
                          Never share this code with anyone. PromoSecure staff will <strong>never</strong> ask for your OTP. If you did not request this code, your account may be at risk.
                        </p>
                      </div>

                      <!-- Didn't request this? -->
                      <div style="border-top:1px solid #e2e8f0;padding-top:18px;">
                        <p style="margin:0 0 4px;color:#1e293b;font-size:14px;font-weight:600;">Didn't request this?</p>
                        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                          If you didn't attempt to log in, someone may be trying to access your account. Please contact the platform administrator immediately:
                        </p>
                        <p style="margin:8px 0 0;">
                          <a href="mailto:vigneshigt@gmail.com" style="display:inline-block;background:#0066CC;color:#ffffff;text-decoration:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;">📧 Contact Admin</a>
                        </p>
                      </div>
                    </div>

                    <!-- Footer -->
                    <div style="background:#1e293b;padding:20px 32px;text-align:center;">
                      <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">
                        This is an automated message from <strong style="color:#e2e8f0;">PromoSecure</strong>
                      </p>
                      <p style="margin:0 0 8px;color:#64748b;font-size:11px;">
                        Enterprise-grade privacy • AI-powered verification • SOC 2 compliant
                      </p>
                      <div style="margin-top:10px;">
                        <a href="https://promosecure-api.vercel.app" style="color:#60a5fa;font-size:11px;text-decoration:none;margin:0 8px;">Website</a>
                        <span style="color:#475569;">•</span>
                        <a href="https://promosecure-api.vercel.app/help" style="color:#60a5fa;font-size:11px;text-decoration:none;margin:0 8px;">Help Center</a>
                        <span style="color:#475569;">•</span>
                        <a href="https://promosecure-api.vercel.app/privacy" style="color:#60a5fa;font-size:11px;text-decoration:none;margin:0 8px;">Privacy Policy</a>
                      </div>
                      <p style="margin:12px 0 0;color:#475569;font-size:10px;">
                        © ${now.getFullYear()} PromoSecure. All rights reserved.
                      </p>
                    </div>
                  </div>
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

        const validOtp = await OTP.findOne({ email });

        if (!validOtp) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found'
            });
        }

        if (validOtp.otp !== otp) {
            validOtp.attempts += 1;
            await validOtp.save();

            if (validOtp.attempts >= 3) {
                await OTP.deleteOne({ _id: validOtp._id });
                return res.status(400).json({
                    success: false,
                    message: 'Too many failed attempts. OTP invalidated.'
                });
            }

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - validOtp.attempts} attempts remaining.`
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
        const validOtp = await OTP.findOne({ email });

        if (!validOtp) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found'
            });
        }

        if (validOtp.otp !== otp) {
            validOtp.attempts += 1;
            await validOtp.save();

            if (validOtp.attempts >= 3) {
                await OTP.deleteOne({ _id: validOtp._id });
                return res.status(400).json({
                    success: false,
                    message: 'Too many failed attempts. OTP invalidated.'
                });
            }

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - validOtp.attempts} attempts remaining.`
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
