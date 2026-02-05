const express = require('express');
const Batch = require('../models/Batch');
const Photo = require('../models/Photo');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/batches
// @desc    Create a new batch
// @access  Promoter only
router.post('/', authorize('promoter'), async (req, res) => {
    try {
        const { title, description, location, client } = req.body;

        // Get the manager who created this promoter
        const batch = await Batch.create({
            title,
            description: description || '',
            location: location || '',
            promoter: req.user._id,
            manager: req.user.createdBy,
            client: client || null // Optional client link
        });

        res.status(201).json({
            success: true,
            batch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/batches
// @desc    Get batches based on role
// @access  All authenticated
router.get('/', async (req, res) => {
    try {
        let query = {};
        const { status } = req.query;

        if (req.user.role === 'admin') {
            // Admin sees all batches
            if (status) query.status = status;
        } else if (req.user.role === 'manager') {
            // Manager sees batches from their promoters
            query.manager = req.user._id;
            if (status) query.status = status;
        } else if (req.user.role === 'promoter') {
            // Promoter sees only their batches
            query.promoter = req.user._id;
            if (status) query.status = status;
        }

        const batches = await Batch.find(query)
            .populate('promoter', 'name email')
            .populate('manager', 'name email companyName')
            .populate('client', 'name logo')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: batches.length,
            batches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/batches/:id
// @desc    Get single batch with photos
// @access  Owner/Manager/Admin
router.get('/:id', async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('promoter', 'name email')
            .populate('manager', 'name email companyName');

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check access
        const hasAccess =
            req.user.role === 'admin' ||
            (req.user.role === 'manager' && batch.manager._id.toString() === req.user._id.toString()) ||
            (req.user.role === 'promoter' && batch.promoter._id.toString() === req.user._id.toString());

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this batch'
            });
        }

        // Get photos (blurred for manager, original for promoter) - always include location
        let photoSelect = 'blurredImage aiMetadata capturedAt location';
        if (req.user.role === 'promoter' && batch.promoter._id.toString() === req.user._id.toString()) {
            photoSelect = 'originalImage blurredImage aiMetadata capturedAt location';
        }

        const photos = await Photo.find({ batch: batch._id }).select(photoSelect);

        res.json({
            success: true,
            batch,
            photos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/batches/:id/report
// @desc    Generate and download PDF report for batch
// @access  Manager or Admin only
router.get('/:id/report', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { generateBatchReport } = require('../utils/pdfGenerator');

        const batch = await Batch.findById(req.params.id)
            .populate('promoter', 'name email')
            .populate('manager', 'name email companyName')
            .populate('client', 'name logo');

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check authorization - manager must own this batch
        if (req.user.role === 'manager' && batch.manager._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this batch'
            });
        }

        // Get photos for the batch
        const photos = await Photo.find({ batch: batch._id })
            .select('blurredImage aiMetadata location capturedAt')
            .sort({ capturedAt: 1 });

        // Generate PDF
        const pdfBuffer = await generateBatchReport(batch, photos, batch.manager);

        // Send PDF
        const filename = `PromoSecure_Report_${batch.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report: ' + error.message
        });
    }
});

// @route   POST /api/batches/:id/email-report
// @desc    Generate PDF report and email to recipient
// @access  Manager or Admin only
router.post('/:id/email-report', authorize('manager', 'admin'), async (req, res) => {
    try {
        const { generateBatchReport } = require('../utils/pdfGenerator');
        const { sendBatchReport, isEmailConfigured } = require('../utils/emailService');

        // Check if email is configured
        if (!isEmailConfigured()) {
            return res.status(400).json({
                success: false,
                message: 'Email not configured. Add SMTP_USER and SMTP_PASS to server .env file.'
            });
        }

        const { email, message } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Recipient email is required'
            });
        }

        const batch = await Batch.findById(req.params.id)
            .populate('promoter', 'name email')
            .populate('manager', 'name email companyName')
            .populate('client', 'name logo');

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        // Check authorization
        if (req.user.role === 'manager' && batch.manager._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Get photos
        const photos = await Photo.find({ batch: batch._id })
            .select('blurredImage aiMetadata location capturedAt')
            .sort({ capturedAt: 1 });

        // Generate PDF
        const pdfBuffer = await generateBatchReport(batch, photos, batch.manager);

        // Send email
        await sendBatchReport({
            to: email,
            clientName: batch.client?.name || '',
            batchTitle: batch.title,
            managerName: batch.manager?.name || 'PromoSecure Manager',
            pdfBuffer,
            message: message || ''
        });

        res.json({
            success: true,
            message: `Report sent to ${email}`
        });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email: ' + error.message
        });
    }
});

// @route   PUT /api/batches/:id
// @desc    Update batch details
// @access  Promoter (owner) only, draft status only
router.put('/:id', authorize('promoter'), async (req, res) => {
    try {
        let batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        if (batch.promoter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (batch.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Can only edit draft batches'
            });
        }

        const { title, description, location } = req.body;
        batch.title = title || batch.title;
        batch.description = description || batch.description;
        batch.location = location || batch.location;
        await batch.save();

        res.json({
            success: true,
            batch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/batches/:id/submit
// @desc    Submit batch for review
// @access  Promoter (owner) only
router.put('/:id/submit', authorize('promoter'), async (req, res) => {
    try {
        let batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        if (batch.promoter.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (batch.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Batch already submitted'
            });
        }

        if (batch.photoCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot submit empty batch'
            });
        }

        // Update AI summary from photos
        const photos = await Photo.find({ batch: batch._id });
        const uniquePhotos = photos.filter(p => p.aiMetadata.isUnique);
        const totalFaces = photos.reduce((sum, p) => sum + p.aiMetadata.facesDetected, 0);

        batch.aiSummary = {
            uniquePeopleCount: uniquePhotos.length,
            totalFacesDetected: totalFaces,
            duplicatesFound: photos.length - uniquePhotos.length,
            verificationScore: Math.round((uniquePhotos.length / photos.length) * 100),
            lastVerifiedAt: new Date()
        };

        batch.status = 'pending';
        batch.submittedAt = new Date();
        await batch.save();

        res.json({
            success: true,
            batch,
            message: 'Batch submitted for review'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/batches/:id/review
// @desc    Approve or reject batch
// @access  Manager only
router.put('/:id/review', authorize('manager'), async (req, res) => {
    try {
        const { action, note } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action must be approve or reject'
            });
        }

        let batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        if (batch.manager.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (batch.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Batch is not pending review'
            });
        }

        batch.status = action === 'approve' ? 'approved' : 'rejected';
        batch.reviewedAt = new Date();
        batch.reviewNote = note || '';
        await batch.save();

        res.json({
            success: true,
            batch,
            message: `Batch ${batch.status}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/batches/:id
// @desc    Delete batch
// @access  Promoter (owner, draft only), Manager (empty batches only), or Admin
router.delete('/:id', async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                message: 'Batch not found'
            });
        }

        const isOwner = batch.promoter.toString() === req.user._id.toString();
        const isManager = req.user.role === 'manager' && batch.manager.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        // Check authorization
        if (!isOwner && !isManager && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Promoters can only delete draft batches
        if (isOwner && batch.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Can only delete draft batches'
            });
        }

        // Note: Managers can now delete batches with photos (per user request)

        // Delete all photos in batch (if any)
        await Photo.deleteMany({ batch: batch._id });
        await batch.deleteOne();

        res.json({
            success: true,
            message: 'Batch deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
