const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP configurations are not present, log it to console and resolve (development fallback)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('\n==================================================');
    console.log(`MOCK SMTP: Verification Email to ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.text}`);
    console.log('==================================================\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'NEWSY TECH'} <${process.env.FROM_EMAIL || 'noreply@newsytech.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
