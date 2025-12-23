const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    // Conversation participants (manager <-> promoter)
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    // Optional: link to a batch for context
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient querying
MessageSchema.index({ participants: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, read: 1 });

// Get conversation between two users
MessageSchema.statics.getConversation = async function (userId1, userId2, limit = 50) {
    return this.find({
        participants: { $all: [userId1, userId2] }
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender', 'name role')
        .populate('receiver', 'name role')
        .populate('batch', 'title');
};

// Get all conversations for a user
MessageSchema.statics.getConversations = async function (userId) {
    // Get latest message from each unique conversation
    return this.aggregate([
        { $match: { participants: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                        '$receiver',
                        '$sender'
                    ]
                },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                                    { $eq: ['$read', false] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
};

// Mark messages as read
MessageSchema.statics.markAsRead = async function (userId, otherUserId) {
    return this.updateMany(
        {
            sender: otherUserId,
            receiver: userId,
            read: false
        },
        {
            read: true,
            readAt: new Date()
        }
    );
};

module.exports = mongoose.model('Message', MessageSchema);
