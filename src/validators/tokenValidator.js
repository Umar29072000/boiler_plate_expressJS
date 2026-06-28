const { body } = require('express-validator');

/**
 * Validation rules for refresh token request
 */
const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

/**
 * Validation rules for revoke token request
 */
const revokeTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

module.exports = {
  refreshTokenValidation,
  revokeTokenValidation,
};
