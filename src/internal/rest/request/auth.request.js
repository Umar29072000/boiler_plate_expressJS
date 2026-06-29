/**
 * Auth Request DTOs
 * Data Transfer Objects for authentication-related requests
 * Handles validation and request parsing
 */

/**
 * Register Request DTO
 * Used for user registration
 */
class RegisterRequest {
  constructor(body) {
    this.name = body.name || '';
    this.email = body.email || '';
    this.password = body.password || '';
  }

  validate() {
    const errors = [];

    // Validate name
    if (!this.name || this.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (this.name && this.name.length > 50) {
      errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
    }

    // Validate email
    if (!this.email || this.email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (this.email && !emailRegex.test(this.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email' });
    }

    // Validate password
    if (!this.password || this.password.trim() === '') {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    if (this.password && this.password.length < 6) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 6 characters',
      });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Login Request DTO
 * Used for user login
 */
class LoginRequest {
  constructor(body) {
    this.email = body.email || '';
    this.password = body.password || '';
  }

  validate() {
    const errors = [];

    // Validate email
    if (!this.email || this.email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    // Validate password
    if (!this.password || this.password.trim() === '') {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Verify Email Request DTO
 * Used for email verification
 */
class VerifyEmailRequest {
  constructor(params) {
    this.token = params.token || '';
  }

  validate() {
    const errors = [];

    if (!this.token || this.token.trim() === '') {
      errors.push({ field: 'token', message: 'Verification token is required' });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Update Profile Request DTO (Auth version)
 * Used for updating user profile through auth endpoint
 */
class UpdateProfileRequest {
  constructor(body) {
    this.name = body.name || '';
    this.email = body.email || '';
  }

  validate() {
    const errors = [];

    // At least one field must be provided
    if (!this.name && !this.email) {
      errors.push({ field: 'general', message: 'At least one field must be provided' });
    }

    // Validate name if provided
    if (this.name && this.name.length > 50) {
      errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
    }

    // Validate email if provided
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (this.email && !emailRegex.test(this.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email' });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Change Password Request DTO
 * Used for changing password
 */
class ChangePasswordRequest {
  constructor(body) {
    this.currentPassword = body.currentPassword || '';
    this.newPassword = body.newPassword || '';
  }

  validate() {
    const errors = [];

    // Validate current password
    if (!this.currentPassword || this.currentPassword.trim() === '') {
      errors.push({ field: 'currentPassword', message: 'Current password is required' });
    }

    // Validate new password
    if (!this.newPassword || this.newPassword.trim() === '') {
      errors.push({ field: 'newPassword', message: 'New password is required' });
    }

    if (this.newPassword && this.newPassword.length < 6) {
      errors.push({
        field: 'newPassword',
        message: 'New password must be at least 6 characters',
      });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Forgot Password Request DTO
 * Used for requesting password reset
 */
class ForgotPasswordRequest {
  constructor(body) {
    this.email = body.email || '';
  }

  validate() {
    const errors = [];

    // Validate email
    if (!this.email || this.email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (this.email && !emailRegex.test(this.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email' });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Reset Password Request DTO
 * Used for resetting password with token
 */
class ResetPasswordRequest {
  constructor(params, body) {
    this.token = params.token || '';
    this.password = body.password || '';
  }

  validate() {
    const errors = [];

    // Validate token
    if (!this.token || this.token.trim() === '') {
      errors.push({ field: 'token', message: 'Reset token is required' });
    }

    // Validate password
    if (!this.password || this.password.trim() === '') {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    if (this.password && this.password.length < 6) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 6 characters',
      });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

module.exports = {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
};
