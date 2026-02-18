const mongoose = require('mongoose');
const { notifyAllStudents } = require('./services/notificationService');
require('dotenv').config();

const testNotification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('--- Testing Notification Service ---');
        console.log(`Current User: ${process.env.EMAIL_USER}`);

        // Send a test notification
        await notifyAllStudents(
            '⚠️ URGENT NOTIFICATION TEST ⚠️',
            'This is a manual test from the server script. Please confirm receipt.',
            '<h3>⚠️ URGENT TEST ⚠️</h3><p>This is a manual test from the backend script.</p><p>If you see this, the system is working!</p>'
        );

        console.log('--- Test Completed ---');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testNotification();
