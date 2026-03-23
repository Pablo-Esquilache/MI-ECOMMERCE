require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.error('❌ Error SMTP:', error.message);
        process.exit(1);
    } else {
        console.log('✅ SMTP OK! Credenciales 100% funcionales.');
        process.exit(0);
    }
});
