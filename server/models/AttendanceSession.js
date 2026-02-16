const mongoose = require('mongoose');

const AttendanceSessionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    absentees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Index for faster lookup of latest session per subject
AttendanceSessionSchema.index({ subject: 1, date: -1 });

module.exports = mongoose.model('AttendanceSession', AttendanceSessionSchema);
