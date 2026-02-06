const mongoose = require('mongoose');

const AllowedStudentSchema = new mongoose.Schema({
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AllowedStudent', AllowedStudentSchema);
