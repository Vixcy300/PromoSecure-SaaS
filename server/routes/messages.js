const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Manager, Promoter
router.get('/conversations', authorize('manager', 'promoter'), async (req, res) => {
    try {
        const conversations = await Message.getConversations(req.user._id);

        // Populate user details
        const populatedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherUser = await User.findById(conv._id).select('name role email');
                return {
                    user: otherUser,
                    lastMessage: {
                        content: conv.lastMessage.content,
                        createdAt: conv.lastMessage.createdAt,
                        isMine: conv.lastMessage.sender.toString() === req.user._id.toString()
                    },
                    unreadCount: conv.unreadCount
                };
            })
        );

        res.json({
            success: true,
            conversations: populatedConversations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/messages/:userId
// @desc    Get conversation with a specific user
// @access  Manager, Promoter
router.get('/:userId', authorize('manager', 'promoter'), async (req, res) => {
    try {
        const otherUser = await User.findById(req.params.userId).select('name role email');
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify user is allowed to chat with this person
        // Managers can chat with their promoters, promoters with their manager
        if (req.user.role === 'manager') {
            const isMyPromoter = await User.findOne({
                _id: req.params.userId,
                role: 'promoter',
                createdBy: req.user._id
            });
            if (!isMyPromoter) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only chat with your promoters'
                });
            }
        } else if (req.user.role === 'promoter') {
            if (req.user.createdBy.toString() !== req.params.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only chat with your manager'
                });
            }
        }

        const messages = await Message.getConversation(req.user._id, req.params.userId, 100);

        // Mark messages as read
        await Message.markAsRead(req.user._id, req.params.userId);

        res.json({
            success: true,
            otherUser,
            messages: messages.reverse() // Oldest first for display
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/messages/:userId
// @desc    Send a message to a user
// @access  Manager, Promoter
router.post('/:userId', authorize('manager', 'promoter'), async (req, res) => {
    try {
        const { content, batchId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        const receiver = await User.findById(req.params.userId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }

        // Verify permission
        if (req.user.role === 'manager') {
            const isMyPromoter = await User.findOne({
                _id: req.params.userId,
                role: 'promoter',
                createdBy: req.user._id
            });
            if (!isMyPromoter) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only message your promoters'
                });
            }
        } else if (req.user.role === 'promoter') {
            if (req.user.createdBy.toString() !== req.params.userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only message your manager'
                });
            }
        }

        const message = await Message.create({
            participants: [req.user._id, receiver._id],
            sender: req.user._id,
            receiver: receiver._id,
            content: content.trim(),
            batch: batchId || null
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name role')
            .populate('receiver', 'name role');

        res.status(201).json({
            success: true,
            message: populatedMessage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Manager, Promoter
router.get('/unread/count', authorize('manager', 'promoter'), async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            read: false
        });

        res.json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
