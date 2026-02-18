const nodemailer = require('nodemailer');
require('dotenv').config();

// --- Email Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- Notification Functions ---

const sendEmail = async (to, subject, text, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
        return;
    }
    try {
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text, html });
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

const notifyAllStudents = async (subject, message, htmlMessage) => {
    try {
        const User = require('../models/User');
        // Fetch BOTH students and admins
        const recipients = await User.find({ role: { $in: ['student', 'admin'] } });

        console.log(`📢 Sending EMAIL notifications to ${recipients.length} users (Students & Admins)...`);

        // Send Emails
        const emailPromises = recipients
            .filter(user => user.email)
            .map(user => sendEmail(user.email, subject, message, htmlMessage));

        await Promise.allSettled(emailPromises);
        console.log('✅ All email notifications processed.');

    } catch (error) {
        console.error('Error in notifyAllStudents:', error);
    }
};

module.exports = {
    sendEmail,
    notifyAllStudents
};
