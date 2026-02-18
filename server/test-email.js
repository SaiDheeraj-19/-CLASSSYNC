const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
    console.log('--- Email Configuration Test ---');
    console.log(`User: ${process.env.EMAIL_USER}`);
    // Don't log the full password for security, just length
    console.log(`Pass Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing EMAIL_USER or EMAIL_PASS in .env file');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: 'ClassSync Notification Test',
            text: 'This is a test email from your ClassSync server. If you see this, email notifications are WORKING!',
            html: '<h3>ClassSync Notification Test</h3><p>This is a test email from your ClassSync server.</p><p><strong>✅ Email notifications are WORKING!</strong></p>'
        });

        console.log('✅ Email sent successfully!');
        console.log(`Message ID: ${info.messageId}`);
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
    }
};

testEmail();
