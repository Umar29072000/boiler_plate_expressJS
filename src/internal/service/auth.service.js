/**
 * Auth Service
 * Business logic layer for Authentication operations
 * Depends on UserRepository for data access
 */

const { loggerWithFields } = require('../../pkg/logger/logger');
const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * Auth Service Interface
 * Defines contract for authentication business operations
 */
class IAuthService {
  async register(ctx, req) {
    throw new Error('Method not implemented');
  }

  async login(ctx, email, password) {
    throw new Error('Method not implemented');
  }

  async verifyEmail(ctx, token) {
    throw new Error('Method not implemented');
  }

  async resendVerification(ctx, userId) {
    throw new Error('Method not implemented');
  }

  async forgotPassword(ctx, email) {
    throw new Error('Method not implemented');
  }

  async resetPassword(ctx, token, newPassword) {
    throw new Error('Method not implemented');
  }

  generateToken(userId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Auth Service Implementation
 */
class AuthService extends IAuthService {
  constructor(userRepository) {
    super();
    this.userRepository = userRepository;
  }

  /**
   * Generate JWT Token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });
  }

  /**
   * Register new user
   */
  async register(ctx, req) {
    const tag = 'internal.service.auth.register.';

    try {
      const { name, email, password } = req;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(ctx, email);

      if (existingUser) {
        loggerWithFields({ tag: tag + '01', email }).error('user already exists');
        throw new Error('USER_ALREADY_EXISTS');
      }

      // Create user
      const user = await this.userRepository.create(ctx, {
        name,
        email,
        password,
        role: 'user',
      });

      // Generate token
      const token = this.generateToken(user._id);

      return { user, token };
    } catch (error) {
      if (error.message !== 'USER_ALREADY_EXISTS') {
        loggerWithFields({ tag: tag + '02', error: error.message }).error(
          'failed to register user (from user repository)'
        );
      }
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(ctx, email, password) {
    const tag = 'internal.service.auth.login.';

    try {
      // Find user with password field (required for authentication)
      const user = await this.userRepository.findByEmailWithPassword(ctx, email);

      if (!user) {
        loggerWithFields({ tag: tag + '01', email }).error('user not found');
        throw new Error('INVALID_CREDENTIALS');
      }

      // Check if password matches
      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        loggerWithFields({ tag: tag + '02', email }).error('invalid password');
        throw new Error('INVALID_CREDENTIALS');
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return { user, token };
    } catch (error) {
      if (error.message !== 'INVALID_CREDENTIALS') {
        loggerWithFields({ tag: tag + '03', error: error.message }).error(
          'failed to login user'
        );
      }
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(ctx, token) {
    const tag = 'internal.service.auth.verifyEmail.';

    try {
      const user = await this.userRepository.findByVerificationToken(ctx, token);

      if (!user) {
        loggerWithFields({ tag: tag + '01' }).error('invalid or expired token');
        throw new Error('INVALID_TOKEN');
      }

      // Check if token is expired
      if (user.emailVerificationExpire && user.emailVerificationExpire < Date.now()) {
        loggerWithFields({ tag: tag + '02', userId: user._id }).error(
          'verification token expired'
        );
        throw new Error('TOKEN_EXPIRED');
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();

      return user;
    } catch (error) {
      if (error.message !== 'INVALID_TOKEN' && error.message !== 'TOKEN_EXPIRED') {
        loggerWithFields({ tag: tag + '03', error: error.message }).error(
          'failed to verify email'
        );
      }
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(ctx, userId) {
    const tag = 'internal.service.auth.resendVerification.';

    try {
      const user = await this.userRepository.findById(ctx, userId);

      if (!user) {
        loggerWithFields({ tag: tag + '01', userId }).error('user not found');
        throw new Error('USER_NOT_FOUND');
      }

      if (user.isEmailVerified) {
        loggerWithFields({ tag: tag + '02', userId }).error('email already verified');
        throw new Error('EMAIL_ALREADY_VERIFIED');
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      return { user, verificationToken };
    } catch (error) {
      if (
        error.message !== 'USER_NOT_FOUND' &&
        error.message !== 'EMAIL_ALREADY_VERIFIED'
      ) {
        loggerWithFields({ tag: tag + '03', error: error.message }).error(
          'failed to resend verification'
        );
      }
      throw error;
    }
  }

  /**
   * Forgot password - generate reset token
   */
  async forgotPassword(ctx, email) {
    const tag = 'internal.service.auth.forgotPassword.';

    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(ctx, email);

      if (!user) {
        loggerWithFields({ tag: tag + '01', email }).error('user not found');
        throw new Error('USER_NOT_FOUND');
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });

      return { user, resetToken };
    } catch (error) {
      if (error.message !== 'USER_NOT_FOUND') {
        loggerWithFields({ tag: tag + '02', error: error.message }).error(
          'failed to generate password reset token'
        );
      }
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(ctx, token, newPassword) {
    const tag = 'internal.service.auth.resetPassword.';

    try {
      // Find user with valid reset token
      const user = await this.userRepository.findByResetToken(ctx, token);

      if (!user) {
        loggerWithFields({ tag: tag + '01' }).error('invalid or expired token');
        throw new Error('INVALID_OR_EXPIRED_TOKEN');
      }

      // Check if token is expired
      if (user.resetPasswordExpire && user.resetPasswordExpire < Date.now()) {
        loggerWithFields({ tag: tag + '02', userId: user._id }).error(
          'reset token expired'
        );
        throw new Error('TOKEN_EXPIRED');
      }

      // Set new password
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return user;
    } catch (error) {
      if (
        error.message !== 'INVALID_OR_EXPIRED_TOKEN' &&
        error.message !== 'TOKEN_EXPIRED'
      ) {
        loggerWithFields({ tag: tag + '03', error: error.message }).error(
          'failed to reset password'
        );
      }
      throw error;
    }
  }
}

/**
 * Factory function to create AuthService instance
 */
function NewAuthService(userRepository) {
  return new AuthService(userRepository);
}

module.exports = {
  IAuthService,
  AuthService,
  NewAuthService,
};
