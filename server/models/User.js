const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Optional now
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: false, // Optional for now
        default: null
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    // Added for future scalability
    department: {
        type: String,
        default: 'CSE'
    },
    semester: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
