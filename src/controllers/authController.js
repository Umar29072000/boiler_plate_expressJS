const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const authService = require('../services/authService');

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  
  sendSuccess(res, 201, { user, token }, 'User registered successfully');
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

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
