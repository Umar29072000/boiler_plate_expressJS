const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { hashToken } = require('../utils/tokenGenerator');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../services/emailService');

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new ApiError(404, 'No user found with that email address');
  }
  
  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  try {
    // Send reset email
    await sendPasswordResetEmail(user, resetToken);
    
    sendSuccess(
      res,
      200,
      null,
      'Password reset email sent. Please check your email.'
    );
  } catch (error) {
    // If email fails, clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new ApiError(500, 'Email could not be sent. Please try again later.');
  }
});

/**
 * @desc    Reset password with token
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  // Hash token to compare with database
  const hashedToken = hashToken(token);
  
  // Find user with valid reset token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  
  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }
  
  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  
  // Send confirmation email
  try {
    await sendPasswordChangedEmail(user);
  } catch (error) {
    // Don't fail if confirmation email fails
    console.error('Failed to send password changed email:', error);
  }
  
  sendSuccess(res, 200, null, 'Password reset successful. You can now login with your new password.');
});

module.exports = {
  forgotPassword,
  resetPassword,
};
