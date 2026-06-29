/**
 * Auth Handler
 * HTTP request handlers for authentication-related endpoints
 * Depends on AuthService and UserService for business logic
 */

const { loggerWithFields } = require('../../pkg/logger/logger');
const { BaseResponse } = require('./response/base.response');
const {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} = require('./request/auth.request');
const { hashToken } = require('../../utils/tokenGenerator');

/**
 * Auth Handler Class
 */
class AuthHandler {
  constructor(authService, userService, emailService) {
    this.authService = authService;
    this.userService = userService;
    this.emailService = emailService;
  }

  /**
   * Register new user
   * @route POST /api/v1/auth/register
   */
  async register(req, res) {
    const tag = 'internal.rest.auth.register.';

    try {
      // Parse and validate request
      const request = new RegisterRequest(req.body);

      try {
        request.validate();
      } catch (validationError) {
        loggerWithFields({ tag: tag + '01', error: validationError }).error(
          'invalid validation'
        );
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_VALIDATION', validationError.errors)
        );
      }

      // Register user
      const { user, token } = await this.authService.register(req, {
        name: request.name,
        email: request.email,
        password: request.password,
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      // Send welcome and verification emails (don't fail registration if email fails)
      if (this.emailService) {
        try {
          await this.emailService.sendWelcomeEmail(user);
          await this.emailService.sendVerificationEmail(user, verificationToken);
        } catch (error) {
          loggerWithFields({ tag: tag + '02', error: error.message }).error(
            'failed to send email'
          );
        }
      }

      return res.status(201).json(
        new BaseResponse(
          201,
          'User registered successfully. Please check your email to verify your account.',
          { user, token }
        )
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '03', error: error.message }).error(
        'failed to register user (from auth service)'
      );

      if (error.message === 'USER_ALREADY_EXISTS') {
        return res.status(400).json(
          new BaseResponse(400, 'USER_ALREADY_EXISTS', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Login user
   * @route POST /api/v1/auth/login
   */
  async login(req, res) {
    const tag = 'internal.rest.auth.login.';

    try {
      // Parse and validate request
      const request = new LoginRequest(req.body);

      try {
        request.validate();
      } catch (validationError) {
        loggerWithFields({ tag: tag + '01', error: validationError }).error(
          'invalid validation'
        );
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_VALIDATION', validationError.errors)
        );
      }

      // Login user
      const { user, token } = await this.authService.login(
        req,
        request.email,
        request.password
      );

      return res.status(200).json(
        new BaseResponse(200, 'Login successful', { user, token })
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '02', error: error.message }).error(
        'failed to login (from auth service)'
      );

      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json(
          new BaseResponse(401, 'INVALID_CREDENTIALS', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Verify email
   * @route GET /api/v1/auth/verify-email/:token
   */
  async verifyEmail(req, res) {
    const tag = 'internal.rest.auth.verifyEmail.';

    try {
      // Parse and validate request
      const request = new VerifyEmailRequest(req.params);

      try {
        request.validate();
      } catch (validationError) {
        loggerWithFields({ tag: tag + '01', error: validationError }).error(
          'invalid validation'
        );
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_VALIDATION', validationError.errors)
        );
      }

      // Hash the token
      const hashedToken = hashToken(request.token);

      // Verify email
      const user = await this.authService.verifyEmail(req, hashedToken);

      return res.status(200).json(
        new BaseResponse(200, 'Email verified successfully', { user })
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '02', error: error.message }).error(
        'failed to verify email (from auth service)'
      );

      if (error.message === 'INVALID_TOKEN') {
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_OR_EXPIRED_TOKEN', null)
        );
      }

      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(400).json(
          new BaseResponse(400, 'TOKEN_EXPIRED', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Resend verification email
   * @route POST /api/v1/auth/resend-verification
   */
  async resendVerification(req, res) {
    const tag = 'internal.rest.auth.resendVerification.';

    try {
      const userId = req.user?.id;

      if (!userId) {
        loggerWithFields({ tag: tag + '01' }).error('user_id not found in context');
        return res.status(401).json(
          new BaseResponse(401, 'UNAUTHORIZED', null)
        );
      }

      // Resend verification
      const { user, verificationToken } = await this.authService.resendVerification(
        req,
        userId
      );

      // Send verification email
      if (this.emailService) {
        try {
          await this.emailService.sendVerificationEmail(user, verificationToken);
        } catch (error) {
          loggerWithFields({ tag: tag + '02', error: error.message }).error(
            'failed to send email'
          );
          return res.status(500).json(
            new BaseResponse(500, 'FAILED_TO_SEND_EMAIL', null)
          );
        }
      }

      return res.status(200).json(
        new BaseResponse(200, 'Verification email sent successfully', null)
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '03', error: error.message }).error(
        'failed to resend verification (from auth service)'
      );

      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json(
          new BaseResponse(404, 'USER_NOT_FOUND', null)
        );
      }

      if (error.message === 'EMAIL_ALREADY_VERIFIED') {
        return res.status(400).json(
          new BaseResponse(400, 'EMAIL_ALREADY_VERIFIED', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Get current logged in user
   * @route GET /api/v1/auth/me
   */
  async getMe(req, res) {
    const tag = 'internal.rest.auth.getMe.';

    try {
      const userId = req.user?.id;

      if (!userId) {
        loggerWithFields({ tag: tag + '01' }).error('user_id not found in context');
        return res.status(401).json(
          new BaseResponse(401, 'UNAUTHORIZED', null)
        );
      }

      const user = await this.userService.findById(req, userId);

      return res.status(200).json(
        new BaseResponse(200, 'SUCCESS', { user })
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '02', error: error.message }).error(
        'failed to get current user (from user service)'
      );

      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json(
          new BaseResponse(404, 'USER_NOT_FOUND', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Update user profile
   * @route PUT /api/v1/auth/update-profile
   */
  async updateProfile(req, res) {
    const tag = 'internal.rest.auth.updateProfile.';

    try {
      const userId = req.user?.id;

      if (!userId) {
        loggerWithFields({ tag: tag + '01' }).error('user_id not found in context');
        return res.status(401).json(
          new BaseResponse(401, 'UNAUTHORIZED', null)
        );
      }

      // Parse and validate request
      const request = new UpdateProfileRequest(req.body);

      try {
        request.validate();
      } catch (validationError) {
        loggerWithFields({ tag: tag + '02', error: validationError }).error(
          'invalid validation'
        );
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_VALIDATION', validationError.errors)
        );
      }

      // Update profile
      const user = await this.userService.update(req, {
        id: userId,
        name: request.name,
        email: request.email,
      });

      return res.status(200).json(
        new BaseResponse(200, 'Profile updated successfully', { user })
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '03', error: error.message }).error(
        'failed to update profile (from user service)'
      );

      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json(
          new BaseResponse(404, 'USER_NOT_FOUND', null)
        );
      }

      if (error.message === 'EMAIL_FOUND') {
        return res.status(409).json(
          new BaseResponse(409, 'EMAIL_ALREADY_EXISTS', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Change password
   * @route PUT /api/v1/auth/change-password
   */
  async changePassword(req, res) {
    const tag = 'internal.rest.auth.changePassword.';

    try {
      const userId = req.user?.id;

      if (!userId) {
        loggerWithFields({ tag: tag + '01' }).error('user_id not found in context');
        return res.status(401).json(
          new BaseResponse(401, 'UNAUTHORIZED', null)
        );
      }

      // Parse and validate request
      const request = new ChangePasswordRequest(req.body);

      try {
        request.validate();
      } catch (validationError) {
        loggerWithFields({ tag: tag + '02', error: validationError }).error(
          'invalid validation'
        );
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_VALIDATION', validationError.errors)
        );
      }

      // Get user with password field (required for password comparison)
      const user = await this.userService.findByIdWithPassword(req, userId);

      if (!user) {
        loggerWithFields({ tag: tag + '03', userId }).error('user not found');
        return res.status(404).json(
          new BaseResponse(404, 'USER_NOT_FOUND', null)
        );
      }

      // Verify current password
      const isPasswordMatch = await user.comparePassword(request.currentPassword);

      if (!isPasswordMatch) {
        loggerWithFields({ tag: tag + '04', userId }).error('current password incorrect');
        return res.status(401).json(
          new BaseResponse(401, 'CURRENT_PASSWORD_INCORRECT', null)
        );
      }

      // Update password
      user.password = request.newPassword;
      await user.save();

      return res.status(200).json(
        new BaseResponse(200, 'Password changed successfully', null)
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '05', error: error.message }).error(
        'failed to change password'
      );

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Forgot password - send reset email
   * @route POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res) {
    const tag = 'internal.rest.auth.forgotPassword.';

    try {
      // Parse and validate request
      const request = new ForgotPasswordRequest(req.body);

      try {
        request.validate();
      } catch (validationError) {
        loggerWithFields({ tag: tag + '01', error: validationError }).error(
          'invalid validation'
        );
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_VALIDATION', validationError.errors)
        );
      }

      // Generate reset token
      const { user, resetToken } = await this.authService.forgotPassword(
        req,
        request.email
      );

      // Send password reset email
      if (this.emailService) {
        try {
          await this.emailService.sendPasswordResetEmail(user, resetToken);
        } catch (error) {
          loggerWithFields({ tag: tag + '02', error: error.message }).error(
            'failed to send password reset email'
          );

          // Clear reset token if email fails
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          await user.save({ validateBeforeSave: false });

          return res.status(500).json(
            new BaseResponse(500, 'EMAIL_COULD_NOT_BE_SENT', null)
          );
        }
      }

      return res.status(200).json(
        new BaseResponse(
          200,
          'Password reset email sent. Please check your email.',
          null
        )
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '03', error: error.message }).error(
        'failed to process forgot password (from auth service)'
      );

      if (error.message === 'USER_NOT_FOUND') {
        return res.status(404).json(
          new BaseResponse(404, 'USER_NOT_FOUND', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Reset password with token
   * @route POST /api/v1/auth/reset-password/:token
   */
  async resetPassword(req, res) {
    const tag = 'internal.rest.auth.resetPassword.';

    try {
      // Parse and validate request
      const request = new ResetPasswordRequest(req.params, req.body);

      try {
        request.validate();
      } catch (validationError) {
        loggerWithFields({ tag: tag + '01', error: validationError }).error(
          'invalid validation'
        );
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_VALIDATION', validationError.errors)
        );
      }

      // Hash the token
      const hashedToken = hashToken(request.token);

      // Reset password
      const user = await this.authService.resetPassword(
        req,
        hashedToken,
        request.password
      );

      // Send password changed confirmation email
      if (this.emailService) {
        try {
          await this.emailService.sendPasswordChangedEmail(user);
        } catch (error) {
          loggerWithFields({ tag: tag + '02', error: error.message }).error(
            'failed to send password changed email'
          );
          // Don't fail if confirmation email fails
        }
      }

      return res.status(200).json(
        new BaseResponse(
          200,
          'Password reset successful. You can now login with your new password.',
          null
        )
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '03', error: error.message }).error(
        'failed to reset password (from auth service)'
      );

      if (error.message === 'INVALID_OR_EXPIRED_TOKEN') {
        return res.status(400).json(
          new BaseResponse(400, 'INVALID_OR_EXPIRED_TOKEN', null)
        );
      }

      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(400).json(
          new BaseResponse(400, 'TOKEN_EXPIRED', null)
        );
      }

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }
}

/**
 * Initialize Auth Handler Routes
 * Wires up routes with handler methods
 */
function InitAuthHandler(router, authService, userService, emailService, authMiddleware) {
  const handler = new AuthHandler(authService, userService, emailService);

  // Public routes
  router.post('/auth/register', handler.register.bind(handler));
  router.post('/auth/login', handler.login.bind(handler));
  router.get('/auth/verify-email/:token', handler.verifyEmail.bind(handler));
  router.post('/auth/forgot-password', handler.forgotPassword.bind(handler));
  router.post('/auth/reset-password/:token', handler.resetPassword.bind(handler));

  // Protected routes
  router.get('/auth/me', authMiddleware, handler.getMe.bind(handler));
  router.put('/auth/update-profile', authMiddleware, handler.updateProfile.bind(handler));
  router.put('/auth/change-password', authMiddleware, handler.changePassword.bind(handler));
  router.post('/auth/resend-verification', authMiddleware, handler.resendVerification.bind(handler));

  return router;
}

module.exports = {
  AuthHandler,
  InitAuthHandler,
};
