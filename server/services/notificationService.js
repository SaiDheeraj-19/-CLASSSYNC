const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const formatWhatsAppNumber = (number) => {
    // Assuming Indian numbers if not prefixed, but should handle + properly
    if (!number) return null;
    let cleanNumber = number.replace(/\D/g, ''); // Remove non-digits
    if (cleanNumber.length === 10) {
        return `whatsapp:+91${cleanNumber}`; // Default to India (+91)
    }
    return `whatsapp:+${cleanNumber}`;
};

const sendEmail = async (to, subject, text, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not set. skipping email notification.');
        console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}, Body: ${text}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendWhatsApp = async (to, message) => {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn('Twilio credentials not set. Skipping WhatsApp notification.');
        console.log(`[WHATSAPP MOCK] To: ${to}, Message: ${message}`);
        return;
    }

    const formattedNumber = formatWhatsAppNumber(to);
    if (!formattedNumber) return;

    try {
        await twilioClient.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER, // e.g., 'whatsapp:+14155238886'
            to: formattedNumber,
            body: message
        });
        console.log(`WhatsApp sent to ${to}`);
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
    }
};

const notifyAllStudents = async (subject, message, htmlMessage) => {
    try {
        const User = require('../models/User'); // Function-scope import to avoid circular dep issues if any
        const students = await User.find({ role: 'student' });

        // Parallel execution for efficiency
        const emailPromises = students
            .filter(student => student.email)
            .map(student => sendEmail(student.email, subject, message, htmlMessage));

        const whatsappPromises = students
            .filter(student => student.phoneNumber)
            .map(student => sendWhatsApp(student.phoneNumber, message));

        await Promise.allSettled([...emailPromises, ...whatsappPromises]);

    } catch (error) {
        console.error('Error in notifyAllStudents:', error);
    }
};

module.exports = {
    sendEmail,
    sendWhatsApp,
    notifyAllStudents
};
