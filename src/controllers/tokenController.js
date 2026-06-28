const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { getIpAddress, sanitizeIp } = require('../utils/ipHelper');
const {
  refreshAccessToken,
  revokeToken,
  revokeAllUserTokens,
  getUserActiveSessions,
} = require('../services/tokenService');

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const ipAddress = sanitizeIp(getIpAddress(req));
  
  const tokens = await refreshAccessToken(token, ipAddress);
  
  sendSuccess(res, 200, tokens, 'Access token refreshed successfully');
});

/**
 * @desc    Revoke refresh token (logout)
 * @route   POST /api/v1/auth/revoke-token
 * @access  Private
 */
const revokeRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const ipAddress = sanitizeIp(getIpAddress(req));
  
  await revokeToken(token, ipAddress);
  
  sendSuccess(res, 200, null, 'Logout successful');
});

/**
 * @desc    Revoke all refresh tokens (logout all devices)
 * @route   POST /api/v1/auth/revoke-all-tokens
 * @access  Private
 */
const revokeAllTokens = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const ipAddress = sanitizeIp(getIpAddress(req));
  
  const count = await revokeAllUserTokens(userId, ipAddress);
  
  sendSuccess(
    res,
    200,
    { revokedCount: count },
    `Logged out from ${count} device(s) successfully`
  );
});

/**
 * @desc    Get active sessions
 * @route   GET /api/v1/auth/sessions
 * @access  Private
 */
const getActiveSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const currentToken = req.body.refreshToken || req.query.refreshToken;
  
  const sessions = await getUserActiveSessions(userId, currentToken);
  
  sendSuccess(res, 200, { sessions }, 'Active sessions retrieved successfully');
});

module.exports = {
  refreshToken,
  revokeRefreshToken,
  revokeAllTokens,
  getActiveSessions,
};
