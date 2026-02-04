const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
