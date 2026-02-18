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
        const students = await User.find({ role: 'student' });

        console.log(`📢 Sending EMAIL notifications to ${students.length} students...`);

        // Send Emails
        const emailPromises = students
            .filter(student => student.email)
            .map(student => sendEmail(student.email, subject, message, htmlMessage));

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
