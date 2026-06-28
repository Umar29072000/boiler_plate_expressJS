const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const authService = require('../services/authService');
const { sendWelcomeEmail, sendVerificationEmail } = require('../services/emailService');
const User = require('../models/User');
const { hashToken } = require('../utils/tokenGenerator');

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  
  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  
  // Send welcome and verification emails (don't fail registration if email fails)
  try {
    await sendWelcomeEmail(user);
    await sendVerificationEmail(user, verificationToken);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
  
  sendSuccess(res, 201, { user, token }, 'User registered successfully. Please check your email to verify your account.');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const { user, token } = await authService.loginUser(email, password);
  
  sendSuccess(res, 200, { user, token }, 'Login successful');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  
  sendSuccess(res, 200, { user }, 'User retrieved successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/update-profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  
  sendSuccess(res, 200, { user }, 'Profile updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  
  sendSuccess(res, 200, null, 'Password changed successfully');
});

/**
 * @desc    Verify email with token
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  // Hash token to compare with database
  const hashedToken = hashToken(token);
  
  // Find user with valid verification token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });
  
  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }
  
  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();
  
  sendSuccess(res, 200, null, 'Email verified successfully');
});

/**
 * @desc    Resend email verification
 * @route   POST /api/v1/auth/resend-verification
 * @access  Private
 */
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }
  
  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  
  // Send verification email
  await sendVerificationEmail(user, verificationToken);
  
  sendSuccess(res, 200, null, 'Verification email sent. Please check your email.');
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
};
