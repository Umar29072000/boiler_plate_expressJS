const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordController = require('../controllers/passwordController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../validators/authValidator');
const {
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../validators/passwordValidator');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);

// Password reset routes (public)
router.post('/forgot-password', forgotPasswordValidation, validate, passwordController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, passwordController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, updateProfileValidation, validate, authController.updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, authController.changePassword);
router.post('/resend-verification', protect, authController.resendVerificationEmail);

module.exports = router;
