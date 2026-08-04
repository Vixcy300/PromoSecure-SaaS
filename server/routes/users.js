const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Client = require('../models/Client');
const OTP = require('../models/OTP');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id, extra = {}) => {
    return jwt.sign({ id, ...extra }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// All routes require authentication
router.use(protect);

// @route   POST /api/users/manager
// @desc    Admin creates a manager account
// @access  Admin only
router.post('/manager', authorize('admin'), async (req, res) => {
    try {
        const { email, password, name, companyName, phone, address, taxId, licenseTier, promoterLimit, aiScanQuota, storageQuotaMB, adminNotes, otp } = req.body;

        // Verify OTP if provided (or allow admin direct creation)
        if (otp) {
            const otpRecord = await OTP.findOne({ email });
            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'OTP expired or not found'
                });
            }

            if (otpRecord.otp !== otp) {
                otpRecord.attempts += 1;
                await otpRecord.save();

                if (otpRecord.attempts >= 3) {
                    await OTP.deleteOne({ _id: otpRecord._id });
                    return res.status(400).json({
                        success: false,
                        message: 'Too many failed attempts. OTP invalidated.'
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`
                });
            }
            await otpRecord.deleteOne();
        }

        const user = await User.create({
            email,
            password,
            name,
            role: 'manager',
            companyName: companyName || '',
            phone: phone || '',
            address: address || '',
            taxId: taxId || '',
            licenseTier: licenseTier || 'pro',
            promoterLimit: promoterLimit ? Number(promoterLimit) : 5,
            aiScanQuota: aiScanQuota ? Number(aiScanQuota) : 1000,
            storageQuotaMB: storageQuotaMB ? Number(storageQuotaMB) : 5120,
            adminNotes: adminNotes || '',
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
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

// @route   POST /api/users/promoter
// @desc    Manager creates a promoter account
// @access  Manager only
router.post('/promoter', authorize('manager'), async (req, res) => {
    try {
        const { email, password, name, otp } = req.body;

        // Verify OTP
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found'
            });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= 3) {
                await OTP.deleteOne({ _id: otpRecord._id });
                return res.status(400).json({
                    success: false,
                    message: 'Too many failed attempts. OTP invalidated.'
                });
            }

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`
            });
        }
        await otpRecord.deleteOne();

        // Check promoter limit
        if (req.user.promotersCreated >= req.user.promoterLimit) {
            return res.status(400).json({
                success: false,
                message: `Promoter limit reached (${req.user.promoterLimit}). Contact admin for more.`
            });
        }

        const user = await User.create({
            email,
            password,
            name,
            role: 'promoter',
            createdBy: req.user._id
        });

        // Increment manager's promoter count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { promotersCreated: 1 }
        });

        res.status(201).json({
            success: true,
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

// @route   GET /api/users
// @desc    Get users based on role
// @access  Admin/Manager
router.get('/', authorize('admin', 'manager'), async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'admin') {
            if (req.query.role) {
                query.role = req.query.role;
            } else {
                query.role = { $in: ['manager', 'promoter', 'client'] };
            }
        } else if (req.user.role === 'manager') {
            query = {
                role: 'promoter',
                createdBy: req.user._id
            };
        }

        const users = await User.find(query)
            .select('-password')
            .populate('createdBy', 'name email companyName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/manager/:id/dossier
// @desc    Comprehensive Manager Dossier for Super Admin
// @access  Admin only
router.get('/manager/:id/dossier', authorize('admin'), async (req, res) => {
    try {
        const manager = await User.findById(req.params.id).select('-password');
        if (!manager || manager.role !== 'manager') {
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        // 1. Fetch all Promoters belonging to this manager
        const promoters = await User.find({ createdBy: manager._id, role: 'promoter' })
            .select('-password')
            .sort({ createdAt: -1 });

        const promoterIds = promoters.map(p => p._id);

        // 2. Fetch all Clients owned by this manager
        const clients = await Client.find({ manager: manager._id }).sort({ createdAt: -1 });

        // 3. Aggregate Batches stats for this manager
        const batchCounts = await Batch.aggregate([
            { $match: { manager: manager._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    photos: { $sum: '$photoCount' },
                    duplicates: { $sum: '$aiSummary.duplicatesFound' },
                    facesDetected: { $sum: '$aiSummary.totalFacesDetected' }
                }
            }
        ]);

        let totalBatches = 0;
        let totalPhotos = 0;
        let totalDuplicates = 0;
        let totalFaces = 0;
        const statusMap = { draft: 0, pending: 0, approved: 0, rejected: 0 };

        batchCounts.forEach(b => {
            if (statusMap[b._id] !== undefined) {
                statusMap[b._id] = b.count;
            }
            totalBatches += b.count;
            totalPhotos += (b.photos || 0);
            totalDuplicates += (b.duplicates || 0);
            totalFaces += (b.facesDetected || 0);
        });

        // 4. Calculate Pass Rate & Fraud Prevention stats
        const passRate = totalBatches > 0 
            ? Math.round((statusMap.approved / totalBatches) * 100) 
            : 100;

        // 5. Promoter activity stats (attach batch counts to each promoter)
        const promoterBatchStats = await Batch.aggregate([
            { $match: { promoter: { $in: promoterIds } } },
            {
                $group: {
                    _id: '$promoter',
                    totalBatches: { $sum: 1 },
                    approvedBatches: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    photos: { $sum: '$photoCount' }
                }
            }
        ]);

        const promoterStatsLookup = {};
        promoterBatchStats.forEach(pbs => {
            promoterStatsLookup[pbs._id.toString()] = pbs;
        });

        const promotersWithStats = promoters.map(p => {
            const pObj = p.toObject();
            const stat = promoterStatsLookup[p._id.toString()] || { totalBatches: 0, approvedBatches: 0, photos: 0 };
            return {
                ...pObj,
                stats: stat,
                isOnline: p.lastActive ? (new Date() - new Date(p.lastActive)) < 15 * 60 * 1000 : false
            };
        });

        // 6. Recent Batches (last 5)
        const recentBatches = await Batch.find({ manager: manager._id })
            .populate('promoter', 'name email')
            .populate('client', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            dossier: {
                manager,
                licenseTier: manager.licenseTier || 'pro',
                promoterLimit: manager.promoterLimit || 5,
                promotersCreated: promoters.length,
                aiScanQuota: manager.aiScanQuota || 1000,
                storageQuotaMB: manager.storageQuotaMB || 5120,
                metrics: {
                    totalBatches,
                    totalPhotos,
                    statusMap,
                    passRate,
                    totalDuplicatesCaught: totalDuplicates,
                    totalFacesProtected: totalFaces
                },
                promoters: promotersWithStats,
                clients,
                recentBatches
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/users/manager/:id/quota
// @desc    Update manager's complete quota, tier, and enterprise profile
// @access  Admin only
router.put('/manager/:id/quota', authorize('admin'), async (req, res) => {
    try {
        const {
            promoterLimit,
            licenseTier,
            aiScanQuota,
            storageQuotaMB,
            companyName,
            name,
            phone,
            address,
            taxId,
            adminNotes,
            isActive
        } = req.body;

        const manager = await User.findById(req.params.id);
        if (!manager || manager.role !== 'manager') {
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        if (promoterLimit !== undefined) manager.promoterLimit = Number(promoterLimit);
        if (licenseTier !== undefined) manager.licenseTier = licenseTier;
        if (aiScanQuota !== undefined) manager.aiScanQuota = Number(aiScanQuota);
        if (storageQuotaMB !== undefined) manager.storageQuotaMB = Number(storageQuotaMB);
        if (companyName !== undefined) manager.companyName = companyName;
        if (name !== undefined) manager.name = name;
        if (phone !== undefined) manager.phone = phone;
        if (address !== undefined) manager.address = address;
        if (taxId !== undefined) manager.taxId = taxId;
        if (adminNotes !== undefined) manager.adminNotes = adminNotes;
        if (isActive !== undefined) manager.isActive = isActive;

        await manager.save();

        res.json({
            success: true,
            user: manager.getPublicProfile(),
            message: 'Manager quotas and profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/users/manager/:id/reset-password
// @desc    Admin Emergency Password Reset Override (no OTP required)
// @access  Admin only
router.post('/manager/:id/reset-password', authorize('admin'), async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: `Password for ${user.email} was successfully reset by Super Admin`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/users/impersonate/:id
// @desc    Admin Impersonate / "Log in as Manager"
// @access  Admin only
router.post('/impersonate/:id', authorize('admin'), async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }

        // Generate token with original admin ID stored for safe return
        const impersonationToken = generateToken(targetUser._id, {
            isImpersonated: true,
            originalAdminId: req.user._id.toString(),
            originalAdminName: req.user.name
        });

        res.json({
            success: true,
            token: impersonationToken,
            user: targetUser.getPublicProfile(),
            message: `Now impersonating ${targetUser.name} (${targetUser.role})`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/users/bulk-action
// @desc    Bulk actions on managers or promoters
// @access  Admin only
router.post('/bulk-action', authorize('admin'), async (req, res) => {
    try {
        const { userIds, action, value } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of user IDs'
            });
        }

        if (action === 'activate') {
            await User.updateMany({ _id: { $in: userIds } }, { isActive: true });
        } else if (action === 'deactivate') {
            // Prevent deactivating super admin
            await User.updateMany({ _id: { $in: userIds }, role: { $ne: 'admin' } }, { isActive: false });
        } else if (action === 'set_promoter_limit') {
            const limit = Number(value);
            if (isNaN(limit) || limit < 0) {
                return res.status(400).json({ success: false, message: 'Invalid promoter limit' });
            }
            await User.updateMany({ _id: { $in: userIds }, role: 'manager' }, { promoterLimit: limit });
        } else if (action === 'set_tier') {
            if (!['starter', 'pro', 'enterprise'].includes(value)) {
                return res.status(400).json({ success: false, message: 'Invalid tier' });
            }
            await User.updateMany({ _id: { $in: userIds }, role: 'manager' }, { licenseTier: value });
        } else if (action === 'reassign_promoters') {
            const newManagerId = value;
            const newManager = await User.findById(newManagerId);
            if (!newManager || newManager.role !== 'manager') {
                return res.status(400).json({ success: false, message: 'Destination manager not found' });
            }

            await User.updateMany(
                { _id: { $in: userIds }, role: 'promoter' },
                { createdBy: newManager._id }
            );

            // Recalculate promoter counts
            const count = await User.countDocuments({ createdBy: newManager._id, role: 'promoter' });
            newManager.promotersCreated = count;
            await newManager.save();
        } else {
            return res.status(400).json({
                success: false,
                message: 'Unknown bulk action'
            });
        }

        res.json({
            success: true,
            message: `Bulk action '${action}' applied to ${userIds.length} accounts successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/promoters/intelligence
// @desc    Global Promoter Intelligence Registry for Super Admin
// @access  Admin only
router.get('/promoters/intelligence', authorize('admin'), async (req, res) => {
    try {
        const promoters = await User.find({ role: 'promoter' })
            .select('-password')
            .populate('createdBy', 'name email companyName licenseTier')
            .sort({ createdAt: -1 });

        const promoterIds = promoters.map(p => p._id);

        // Aggregate batch stats per promoter
        const batchAgg = await Batch.aggregate([
            { $match: { promoter: { $in: promoterIds } } },
            {
                $group: {
                    _id: '$promoter',
                    totalBatches: { $sum: 1 },
                    approvedBatches: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejectedBatches: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    },
                    pendingBatches: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    draftBatches: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    totalPhotos: { $sum: '$photoCount' },
                    totalDuplicates: { $sum: '$aiSummary.duplicatesFound' },
                    totalFaces: { $sum: '$aiSummary.totalFacesDetected' },
                    avgVerificationScore: { $avg: '$aiSummary.verificationScore' },
                    lastLocation: { $last: '$location' },
                    lastGps: { $last: '$gpsCoordinates' },
                    lastDevice: { $last: '$deviceInfo' },
                    lastBatchDate: { $max: '$createdAt' }
                }
            }
        ]);

        const statsMap = {};
        batchAgg.forEach(b => {
            statsMap[b._id.toString()] = b;
        });

        const enrichedPromoters = promoters.map(p => {
            const stat = statsMap[p._id.toString()] || {
                totalBatches: 0,
                approvedBatches: 0,
                rejectedBatches: 0,
                pendingBatches: 0,
                draftBatches: 0,
                totalPhotos: 0,
                totalDuplicates: 0,
                totalFaces: 0,
                avgVerificationScore: 98,
                lastLocation: '',
                lastGps: null,
                lastDevice: '',
                lastBatchDate: null
            };

            const approvalRatio = stat.totalBatches > 0
                ? Math.round((stat.approvedBatches / stat.totalBatches) * 100)
                : 100;

            // Compute composite quality score (0-100)
            const qualityScore = Math.max(70, Math.min(100, Math.round(
                (stat.avgVerificationScore || 95) * 0.6 +
                (approvalRatio) * 0.4 -
                (stat.totalDuplicates * 2)
            )));

            const isOnline = p.lastActive ? (new Date() - new Date(p.lastActive)) < 15 * 60 * 1000 : false;

            return {
                ...p.toObject(),
                stats: {
                    ...stat,
                    approvalRatio,
                    qualityScore
                },
                isOnline
            };
        });

        res.json({
            success: true,
            promoters: enrichedPromoters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/promoter/:id/dossier
// @desc    Detailed Promoter Dossier & Telemetry Audit
// @access  Admin only
router.get('/promoter/:id/dossier', authorize('admin'), async (req, res) => {
    try {
        const promoter = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'name email companyName phone licenseTier');

        if (!promoter || promoter.role !== 'promoter') {
            return res.status(404).json({
                success: false,
                message: 'Promoter not found'
            });
        }

        // Fetch recent batches
        const recentBatches = await Batch.find({ promoter: promoter._id })
            .populate('client', 'name')
            .populate('manager', 'name companyName')
            .sort({ createdAt: -1 })
            .limit(10);

        // Aggregate stats
        const batches = await Batch.find({ promoter: promoter._id });
        let totalBatches = batches.length;
        let approved = 0;
        let rejected = 0;
        let pending = 0;
        let totalPhotos = 0;
        let totalDuplicates = 0;
        let totalFaces = 0;
        let scoreSum = 0;

        batches.forEach(b => {
            if (b.status === 'approved') approved++;
            if (b.status === 'rejected') rejected++;
            if (b.status === 'pending') pending++;
            totalPhotos += (b.photoCount || 0);
            totalDuplicates += (b.aiSummary?.duplicatesFound || 0);
            totalFaces += (b.aiSummary?.totalFacesDetected || 0);
            scoreSum += (b.aiSummary?.verificationScore || 95);
        });

        const approvalRatio = totalBatches > 0 ? Math.round((approved / totalBatches) * 100) : 100;
        const avgScore = totalBatches > 0 ? Math.round(scoreSum / totalBatches) : 98;
        const qualityScore = Math.max(70, Math.min(100, Math.round(avgScore * 0.6 + approvalRatio * 0.4 - totalDuplicates * 2)));

        res.json({
            success: true,
            dossier: {
                promoter,
                manager: promoter.createdBy,
                metrics: {
                    totalBatches,
                    approved,
                    rejected,
                    pending,
                    approvalRatio,
                    totalPhotos,
                    totalDuplicates,
                    totalFaces,
                    qualityScore
                },
                recentBatches,
                isOnline: promoter.lastActive ? (new Date() - new Date(promoter.lastActive)) < 15 * 60 * 1000 : false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/users/promoter/:id/reset-password
// @desc    Admin Emergency Password Reset for Promoter
// @access  Admin only
router.post('/promoter/:id/reset-password', authorize('admin'), async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'promoter') {
            return res.status(404).json({
                success: false,
                message: 'Promoter not found'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: `Password for promoter ${user.email} reset successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/stats
// @desc    Get user statistics with detailed analytics
// @access  Admin only
router.get('/stats', authorize('admin'), async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const batchStats = await Batch.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalBatches = await Batch.countDocuments();
        const totalPhotos = await Batch.aggregate([
            { $group: { _id: null, total: { $sum: '$photoCount' } } }
        ]);

        // Get manager leaderboard (top managers by approved batches)
        const managerLeaderboard = await Batch.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: '$manager',
                    approvedBatches: { $sum: 1 },
                    totalPhotos: { $sum: '$photoCount' }
                }
            },
            { $sort: { approvedBatches: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'managerInfo'
                }
            },
            { $unwind: '$managerInfo' },
            {
                $project: {
                    name: '$managerInfo.name',
                    companyName: '$managerInfo.companyName',
                    approvedBatches: 1,
                    totalPhotos: 1
                }
            }
        ]);

        // Get daily activity for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyActivity = await Batch.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    batches: { $sum: 1 },
                    photos: { $sum: '$photoCount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            stats: {
                users: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
                batches: batchStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
                totalBatches,
                totalPhotos: totalPhotos[0]?.total || 0,
                managerLeaderboard,
                dailyActivity
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get a single user by ID
// @access  Authenticated users
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.user.role === 'promoter') {
            if (req.user.createdBy.toString() !== req.params.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view your own manager'
                });
            }
        }

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/users/:id/limit
// @desc    Update manager's promoter limit
// @access  Admin only
router.put('/:id/limit', authorize('admin'), async (req, res) => {
    try {
        const { promoterLimit } = req.body;

        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'manager') {
            return res.status(404).json({
                success: false,
                message: 'Manager not found'
            });
        }

        user.promoterLimit = promoterLimit;
        await user.save();

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/users/:id/toggle
// @desc    Toggle user active status
// @access  Admin/Manager
router.put('/:id/toggle', authorize('admin', 'manager'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.user.role === 'manager') {
            if (user.role !== 'promoter' || user.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }
        }

        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate yourself'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            user: user.getPublicProfile(),
            message: user.isActive ? 'User activated' : 'User deactivated'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete admin accounts'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
