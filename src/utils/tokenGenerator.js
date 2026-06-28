const crypto = require('crypto');

/**
 * Generate random token untuk email verification atau password reset
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash token untuk disimpan di database
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate token expiry time
 * @param {number} hours - Number of hours until expiry
 */
const getTokenExpiry = (hours = 24) => {
  return Date.now() + hours * 60 * 60 * 1000;
};

module.exports = {
  generateToken,
  hashToken,
  getTokenExpiry,
};
