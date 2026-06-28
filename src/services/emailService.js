const fs = require('fs');
const path = require('path');
const { getTransporter } = require('../config/email');
const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Load email template
 */
const loadTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf-8');
};

/**
 * Replace placeholders in template
 */
const replacePlaceholders = (template, data) => {
  let result = template;
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(placeholder, data[key]);
  });
  return result;
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: `${config.email.fromName} <${config.email.from}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL for Ethereal (development)
    if (config.env === 'development' && !config.email.user) {
      logger.info(`Preview Email URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    logger.info(`Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  const template = loadTemplate('welcome');
  const html = replacePlaceholders(template, {
    name: user.name,
    email: user.email,
    appName: config.email.fromName,
    currentYear: new Date().getFullYear(),
  });
  
  await sendEmail({
    to: user.email,
    subject: `Welcome to ${config.email.fromName}!`,
    html,
  });
};

/**
 * Send email verification
 */
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${config.frontendUrl}/verify-email/${verificationToken}`;
  
  const template = loadTemplate('verifyEmail');
  const html = replacePlaceholders(template, {
    name: user.name,
    verificationUrl,
    appName: config.email.fromName,
    currentYear: new Date().getFullYear(),
  });
  
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address',
    html,
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  
  const template = loadTemplate('resetPassword');
  const html = replacePlaceholders(template, {
    name: user.name,
    resetUrl,
    appName: config.email.fromName,
    currentYear: new Date().getFullYear(),
  });
  
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html,
  });
};

/**
 * Send password changed confirmation email
 */
const sendPasswordChangedEmail = async (user) => {
  const template = loadTemplate('passwordChanged');
  const html = replacePlaceholders(template, {
    name: user.name,
    appName: config.email.fromName,
    supportEmail: config.email.from,
    currentYear: new Date().getFullYear(),
  });
  
  await sendEmail({
    to: user.email,
    subject: 'Your Password Has Been Changed',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
