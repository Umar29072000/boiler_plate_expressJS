const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');
const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * Generate JWT access token (short-lived)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpire,
  });
};

/**
 * Generate and save refresh token (long-lived)
 */
const generateRefreshToken = async (userId, ipAddress) => {
  // Generate random token
  const token = crypto.randomBytes(40).toString('hex');
  
  // Calculate expiration
  const expiresAt = new Date();
  const days = parseInt(config.jwt.refreshTokenExpire) || 7;
  expiresAt.setDate(expiresAt.getDate() + days);
  
  // Create refresh token document
  const refreshToken = await RefreshToken.create({
    token, // Will be hashed by pre-save hook
    user: userId,
    expiresAt,
    createdByIp: ipAddress,
  });
  
  // Return the unhashed token
  return token;
};

/**
 * Hash token for database comparison
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (token, ipAddress) => {
  // Hash the token to compare with database
  const hashedToken = hashToken(token);
  
  // Find refresh token in database
  const refreshToken = await RefreshToken.findOne({ token: hashedToken }).populate('user');
  
  if (!refreshToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }
  
  // Check if token is active
  if (!refreshToken.isActive()) {
    throw new ApiError(401, 'Refresh token is no longer valid');
  }
  
  // Check if user still exists
  if (!refreshToken.user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Generate new access token
  const accessToken = generateAccessToken(refreshToken.user._id);
  
  // Optional: Token rotation - generate new refresh token
  // Uncomment below for token rotation
  /*
  const newRefreshToken = await generateRefreshToken(refreshToken.user._id, ipAddress);
  
  // Mark old token as replaced
  refreshToken.revokedAt = new Date();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = hashToken(newRefreshToken);
  await refreshToken.save();
  
  return { accessToken, refreshToken: newRefreshToken };
  */
  
  // Without rotation, return same refresh token
  return { accessToken, refreshToken: token };
};

/**
 * Revoke refresh token (logout)
 */
const revokeToken = async (token, ipAddress) => {
  const hashedToken = hashToken(token);
  
  const refreshToken = await RefreshToken.findOne({ token: hashedToken });
  
  if (!refreshToken) {
    throw new ApiError(404, 'Refresh token not found');
  }
  
  if (refreshToken.revokedAt) {
    throw new ApiError(400, 'Token already revoked');
  }
  
  // Revoke token
  refreshToken.revokedAt = new Date();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
  
  return refreshToken;
};

/**
 * Revoke all refresh tokens for a user (logout all devices)
 */
const revokeAllUserTokens = async (userId, ipAddress) => {
  const result = await RefreshToken.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
        revokedByIp: ipAddress,
      },
    }
  );
  
  return result.modifiedCount;
};

/**
 * Get all active sessions for a user
 */
const getUserActiveSessions = async (userId, currentToken = null) => {
  const hashedCurrentToken = currentToken ? hashToken(currentToken) : null;
  
  const sessions = await RefreshToken.find({
    user: userId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select('createdAt createdByIp expiresAt token')
    .sort({ createdAt: -1 })
    .lean();
  
  return sessions.map(session => ({
    createdAt: session.createdAt,
    createdByIp: session.createdByIp,
    expiresAt: session.expiresAt,
    isCurrentSession: hashedCurrentToken === session.token,
  }));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeToken,
  revokeAllUserTokens,
  getUserActiveSessions,
};
