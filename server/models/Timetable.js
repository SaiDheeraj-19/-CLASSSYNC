const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        unique: true
    },
    slots: [{
        time: String,
        subject: String,
        teacher: String,
        room: String
    }]
});

module.exports = mongoose.model('Timetable', TimetableSchema);
