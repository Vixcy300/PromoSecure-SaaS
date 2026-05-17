const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// @route   GET /api/comments/:postId
// @desc    Get all comments for a blog post
// @access  Public
router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, comments });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to load comments' });
    }
});

// @route   POST /api/comments
// @desc    Create a new comment (public, with anti-bot validation)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { postId, name, text, honeypot, captchaAnswer, captchaExpected } = req.body;

        // Anti-Bot: Honeypot check
        if (honeypot && honeypot.trim() !== '') {
            return res.status(400).json({ success: false, message: 'Automated request blocked.' });
        }

        // Anti-Bot: Math captcha verification
        if (parseInt(captchaAnswer) !== parseInt(captchaExpected)) {
            return res.status(400).json({ success: false, message: 'Verification failed.' });
        }

        if (!name || !text || !postId) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (name.trim().length > 80 || text.trim().length > 2000) {
            return res.status(400).json({ success: false, message: 'Input too long.' });
        }

        const comment = await Comment.create({
            postId,
            name: name.trim(),
            text: text.trim()
        });

        res.status(201).json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to post comment' });
    }
});

module.exports = router;
