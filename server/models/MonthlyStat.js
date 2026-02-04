const mongoose = require('mongoose');

const MonthlyStatSchema = new mongoose.Schema({
    month: {
        type: String, // e.g., "January 2026"
        required: true
    },
    totalWorkingDays: {
        type: Number,
        required: true,
        default: 0
    },
    totalClassesConducted: {
        type: Number,
        required: true,
        default: 0
    },
    notes: String
}, { timestamps: true });

module.exports = mongoose.model('MonthlyStat', MonthlyStatSchema);
