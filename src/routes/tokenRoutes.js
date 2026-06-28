const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');
const {
  refreshTokenValidation,
  revokeTokenValidation,
} = require('../validators/tokenValidator');

// Public routes
router.post('/refresh-token', refreshTokenValidation, validate, tokenController.refreshToken);

// Protected routes
router.post('/revoke-token', protect, revokeTokenValidation, validate, tokenController.revokeRefreshToken);
router.post('/revoke-all-tokens', protect, tokenController.revokeAllTokens);
router.get('/sessions', protect, tokenController.getActiveSessions);

module.exports = router;
