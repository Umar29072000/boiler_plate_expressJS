const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');
const config = require('./index');

/**
 * Create email transporter
 */
const createTransporter = async () => {
  // Development mode: use Ethereal Email (fake SMTP)
  if (config.env === 'development' && !config.email.user) {
    logger.info('Creating Ethereal Email account for development...');
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  
  // Production mode: use configured email service
  const transportOptions = {
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  };
  
  // Gmail specific configuration
  if (config.email.service === 'gmail') {
    transportOptions.service = 'gmail';
  }
  
  return nodemailer.createTransporter(transportOptions);
};

/**
 * Get transporter instance (singleton)
 */
let transporter = null;
const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

module.exports = { getTransporter };
