const nodemailer = require('nodemailer');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

// --- Email Setup ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- WhatsApp Setup (Free Method) ---
let whatsappClient;
let isWhatsAppReady = false;

try {
    console.log('Initializing WhatsApp Client...');
    whatsappClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox']
        }
    });

    whatsappClient.on('qr', (qr) => {
        console.log('\n=============================================================');
        console.log('SCAN THIS QR CODE WITH WHATSAPP TO ENABLE NOTIFICATIONS');
        console.log('=============================================================\n');
        qrcode.generate(qr, { small: true });
    });

    whatsappClient.on('ready', () => {
        console.log('\n✅ WhatsApp Client is Ready!\n');
        isWhatsAppReady = true;
    });

    // Helper to find Group IDs
    whatsappClient.on('message', async msg => {
        if (msg.body === '!groupinfo') {
            const chat = await msg.getChat();
            if (chat.isGroup) {
                console.log(`\nUNKNOWN GROUP ID FOUND: ${chat.id._serialized}`);
                console.log(`Group Name: ${chat.name}\n`);
                msg.reply(`Group ID: ${chat.id._serialized}`);
            }
        }
    });

    whatsappClient.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp Auth Failure:', msg);
    });

    whatsappClient.initialize();
} catch (err) {
    console.error('Failed to initialize WhatsApp client:', err);
}

// Helper: Format number to WhatsApp ID (e.g., 919876543210@c.us)
const formatToWhatsAppId = (number) => {
    if (!number) return null;
    let cleanNumber = number.replace(/\D/g, ''); // Remove non-digits

    // Add country code 91 if missing (assuming India)
    if (cleanNumber.length === 10) {
        cleanNumber = '91' + cleanNumber;
    }

    return `${cleanNumber}@c.us`;
};

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

const sendWhatsApp = async (to, message) => {
    if (!isWhatsAppReady) {
        console.log(`[WHATSAPP MOCK - CLIENT NOT READY] To: ${to}, Message: ${message}`);
        return;
    }

    // Check if sending to a group (from .env) or individual
    let chatId;
    if (to === 'GROUP') {
        chatId = process.env.WHATSAPP_GROUP_ID;
        if (!chatId) {
            console.warn('WHATSAPP_GROUP_ID not set in .env. Skipping group notification.');
            return;
        }
        // Ensure format is correct for groups (usually ends in @g.us)
        if (!chatId.endsWith('@g.us')) {
            chatId += '@g.us';
        }
    } else {
        chatId = formatToWhatsAppId(to);
    }

    if (!chatId) return;

    try {
        await whatsappClient.sendMessage(chatId, message);
        console.log(`📱 WhatsApp sent to ${to === 'GROUP' ? 'Group' : to}`);
    } catch (error) {
        console.error('Error sending WhatsApp:', error.message);
    }
};

const notifyAllStudents = async (subject, message, htmlMessage) => {
    try {
        const User = require('../models/User');
        const students = await User.find({ role: 'student' });

        console.log(`📢 Processing notifications...`);

        // 1. Send Emails (Still individual)
        const emailPromises = students
            .filter(student => student.email)
            .map(student => sendEmail(student.email, subject, message, htmlMessage));

        // 2. Send WhatsApp to GROUP (Single message)
        const whatsappPromise = sendWhatsApp('GROUP', `*${subject}*\n\n${message}`);

        await Promise.allSettled([...emailPromises, whatsappPromise]);
        console.log('✅ All notifications processed.');

    } catch (error) {
        console.error('Error in notifyAllStudents:', error);
    }
};

module.exports = {
    sendEmail,
    sendWhatsApp,
    notifyAllStudents
};
