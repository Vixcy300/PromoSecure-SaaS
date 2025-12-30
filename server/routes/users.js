const express = require('express');
const User = require('../models/User');
const Batch = require('../models/Batch');
const OTP = require('../models/OTP');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/users/manager
// @desc    Admin creates a manager account
// @access  Admin only
router.post('/manager', authorize('admin'), async (req, res) => {
    try {
        const { email, password, name, companyName, promoterLimit, otp } = req.body;

        // Verify OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }
        await otpRecord.deleteOne();

        const user = await User.create({
            email,
            password,
            name,
            role: 'manager',
            companyName: companyName || '',
            promoterLimit: promoterLimit || 5,
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
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
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
            // Admin can see all managers and their promoters
            if (req.query.role) {
                query.role = req.query.role;
            } else {
                query.role = { $in: ['manager', 'promoter'] };
            }
        } else if (req.user.role === 'manager') {
            // Manager can only see their promoters
            query = {
                role: 'promoter',
                createdBy: req.user._id
            };
        }

        const users = await User.find(query)
            .select('-password')
            .populate('createdBy', 'name email')
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
// @access  Admin/Manager (for their promoters)
router.put('/:id/toggle', authorize('admin', 'manager'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Managers can only toggle their own promoters
        if (req.user.role === 'manager') {
            if (user.role !== 'promoter' || user.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }
        }

        // Admin cannot deactivate themselves
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
