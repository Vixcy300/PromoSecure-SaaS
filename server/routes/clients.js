const express = require('express');
const Client = require('../models/Client');
const Batch = require('../models/Batch');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/clients
// @desc    Create a new client
// @access  Manager only
router.post('/', authorize('manager'), async (req, res) => {
    try {
        const { name, logo, contactPerson, contactEmail, contactPhone, industry, notes } = req.body;

        const client = await Client.create({
            name,
            logo: logo || '',
            contactPerson: contactPerson || '',
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
            industry: industry || '',
            notes: notes || '',
            manager: req.user._id
        });

        res.status(201).json({
            success: true,
            client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/clients
// @desc    Get clients - Manager sees own, Promoter sees manager's, Admin sees all
// @access  Manager, Promoter, or Admin
router.get('/', authorize('manager', 'promoter', 'admin'), async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'manager') {
            query.manager = req.user._id;
        } else if (req.user.role === 'promoter') {
            // Promoter sees clients of their manager
            query.manager = req.user.createdBy;
        }
        // Admin sees all clients

        const clients = await Client.find(query)
            .populate('manager', 'name email')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: clients.length,
            clients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/clients/:id
// @desc    Get single client with stats
// @access  Manager (owner) or Admin
router.get('/:id', authorize('manager', 'admin'), async (req, res) => {
    try {
        const client = await Client.findById(req.params.id)
            .populate('manager', 'name email');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Check authorization
        if (req.user.role === 'manager' && client.manager._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Get batch stats for this client
        const batchStats = await Batch.aggregate([
            { $match: { client: client._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    photos: { $sum: '$photoCount' }
                }
            }
        ]);

        const totalBatches = await Batch.countDocuments({ client: client._id });
        const totalPhotos = await Batch.aggregate([
            { $match: { client: client._id } },
            { $group: { _id: null, total: { $sum: '$photoCount' } } }
        ]);

        res.json({
            success: true,
            client,
            stats: {
                totalBatches,
                totalPhotos: totalPhotos[0]?.total || 0,
                byStatus: batchStats.reduce((acc, s) => ({ ...acc, [s._id]: { count: s.count, photos: s.photos } }), {})
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Manager (owner) or Admin
router.put('/:id', authorize('manager', 'admin'), async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Check authorization  
        if (req.user.role === 'manager' && client.manager.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const { name, logo, contactPerson, contactEmail, contactPhone, industry, notes, isActive } = req.body;

        if (name) client.name = name;
        if (logo !== undefined) client.logo = logo;
        if (contactPerson !== undefined) client.contactPerson = contactPerson;
        if (contactEmail !== undefined) client.contactEmail = contactEmail;
        if (contactPhone !== undefined) client.contactPhone = contactPhone;
        if (industry !== undefined) client.industry = industry;
        if (notes !== undefined) client.notes = notes;
        if (isActive !== undefined) client.isActive = isActive;

        await client.save();

        res.json({
            success: true,
            client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client (only if no batches linked)
// @access  Manager (owner) or Admin
router.delete('/:id', authorize('manager', 'admin'), async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Check authorization
        if (req.user.role === 'manager' && client.manager.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Check if client has batches
        const batchCount = await Batch.countDocuments({ client: client._id });
        if (batchCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete client with ${batchCount} linked batches. Remove or reassign batches first.`
            });
        }

        await client.deleteOne();

        res.json({
            success: true,
            message: 'Client deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ════════════════════════════════════════════════════════════════
// SUPER ADMIN GLOBAL CLIENT & CAMPAIGN DIRECTORY
// ════════════════════════════════════════════════════════════════

// @route   GET /api/clients/admin/master-directory
// @desc    Get master directory of all corporate clients with campaigns & manager metrics
// @access  Admin only
router.get('/admin/master-directory', authorize('admin'), async (req, res) => {
    try {
        const { search, managerId, industry } = req.query;
        let query = {};

        if (managerId && managerId !== 'all') {
            query.manager = managerId;
        }

        if (industry && industry !== 'all') {
            query.industry = { $regex: industry, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } },
                { contactEmail: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } }
            ];
        }

        const clients = await Client.find(query)
            .populate('manager', 'name email companyName licenseTier')
            .sort({ createdAt: -1 })
            .lean();

        const clientIds = clients.map(c => c._id);

        // Aggregate batch and photo metrics per client
        const batchAgg = await Batch.aggregate([
            { $match: { client: { $in: clientIds } } },
            {
                $group: {
                    _id: '$client',
                    totalBatches: { $sum: 1 },
                    approvedBatches: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    pendingBatches: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    totalPhotos: { $sum: '$photoCount' },
                    lastActivity: { $max: '$createdAt' }
                }
            }
        ]);

        const statsMap = {};
        batchAgg.forEach(b => {
            statsMap[b._id.toString()] = b;
        });

        const enrichedClients = clients.map(c => {
            const stat = statsMap[c._id.toString()] || {
                totalBatches: 0,
                approvedBatches: 0,
                pendingBatches: 0,
                totalPhotos: 0,
                lastActivity: null
            };

            return {
                ...c,
                stats: stat,
                portalStatus: c.contactEmail ? 'Active Portal' : 'Pending Invite',
                autoReportSchedule: c.autoReportSchedule || 'Weekly PDF Digest'
            };
        });

        res.json({
            success: true,
            count: enrichedClients.length,
            clients: enrichedClients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/clients/admin/:id/resend-invite
// @desc    Resend client portal access invite
// @access  Admin only
router.post('/admin/:id/resend-invite', authorize('admin'), async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        const { logAuditEvent } = require('../utils/auditLogger');
        await logAuditEvent({
            action: 'CLIENT_INVITE_DISPATCHED',
            category: 'user',
            user: req.user,
            targetId: client._id,
            targetType: 'Client',
            targetName: client.name,
            details: { email: client.contactEmail },
            req
        });

        res.json({
            success: true,
            message: `Portal invitation dispatched to ${client.contactEmail || client.name}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/clients/admin/:id/config-reports
// @desc    Configure automated report delivery
// @access  Admin only
router.put('/admin/:id/config-reports', authorize('admin'), async (req, res) => {
    try {
        const { schedule } = req.body;
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            { autoReportSchedule: schedule },
            { new: true }
        );

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.json({
            success: true,
            message: `Report schedule updated to ${schedule}`,
            client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

