const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    totalClasses: {
        type: Number,
        required: true,
        default: 0
    },
    attendedClasses: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });

// Ensure a student has only one record per subject
AttendanceSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
