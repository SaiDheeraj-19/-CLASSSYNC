const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 },
        votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }],
    active: {
        type: Boolean,
        default: true
    },
    votedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Poll', pollSchema);
