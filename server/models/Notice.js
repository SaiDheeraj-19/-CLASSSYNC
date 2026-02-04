const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['notice', 'event'],
        default: 'notice'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);
