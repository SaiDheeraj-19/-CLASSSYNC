const mongoose = require('mongoose');
const AttendanceSession = require('./server/models/AttendanceSession');
const config = require('./server/config/default.json'); // Assuming config is here or I'll just use the connection string if I can find it.
// Actually, better to just require db connection utility if available.

// I'll try to connect using the pattern from server/index.js
require('dotenv').config();
const db = process.env.MONGO_URI || "mongodb+srv://saidheeraj19:saidheeraj19@classsync.g997x.mongodb.net/?retryWrites=true&w=majority&appName=ClassSync";

const check = async () => {
    try {
        await mongoose.connect(db);
        console.log("Connected to DB");

        // Find sessions for FSD-1 on Feb 16 or recent
        const sessions = await AttendanceSession.find({}).sort({ createdAt: -1 }).limit(20);

        console.log("Recent Sessions:");
        sessions.forEach(s => {
            console.log(`Subject: ${s.subject}, Date: ${s.date}, Time: ${s.timeSlot}, Created: ${s.createdAt}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
