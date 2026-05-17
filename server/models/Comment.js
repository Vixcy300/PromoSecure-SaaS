const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: {
        type: Number,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', commentSchema);
