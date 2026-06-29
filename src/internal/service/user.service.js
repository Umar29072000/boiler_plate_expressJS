/**
 * User Service
 * Business logic layer for User operations
 * Depends on UserRepository for data access
 */

const { loggerWithFields } = require('../../pkg/logger/logger');

/**
 * User Service Interface
 * Defines contract for user business operations
 */
class IUserService {
  async show(ctx, req) {
    throw new Error('Method not implemented');
  }

  async findById(ctx, id) {
    throw new Error('Method not implemented');
  }

  async findByIdWithPassword(ctx, id) {
    throw new Error('Method not implemented');
  }

  async update(ctx, req) {
    throw new Error('Method not implemented');
  }

  async delete(ctx, id) {
    throw new Error('Method not implemented');
  }
}

/**
 * User Service Implementation
 */
class UserService extends IUserService {
  constructor(userRepository) {
    super();
    this.userRepository = userRepository;
  }

  /**
   * Show users with pagination
   */
  async show(ctx, req) {
    const tag = 'internal.service.user.show.';

    try {
      const data = await this.userRepository.show(ctx, req);
      return data;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to get users (from user repository)'
      );
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(ctx, id) {
    const tag = 'internal.service.user.findById.';

    try {
      const user = await this.userRepository.findById(ctx, id);

      if (!user) {
        loggerWithFields({ tag: tag + '01', userId: id }).error('user not found');
        throw new Error('USER_NOT_FOUND');
      }

      return user;
    } catch (error) {
      if (error.message !== 'USER_NOT_FOUND') {
        loggerWithFields({ tag: tag + '02', error: error.message }).error(
          'failed to find user by ID (from user repository)'
        );
      }
      throw error;
    }
  }

  /**
   * Find user by ID with password field
   * Used for authentication purposes (e.g., change password)
   */
  async findByIdWithPassword(ctx, id) {
    const tag = 'internal.service.user.findByIdWithPassword.';

    try {
      const user = await this.userRepository.findByIdWithPassword(ctx, id);

      if (!user) {
        loggerWithFields({ tag: tag + '01', userId: id }).error('user not found');
        throw new Error('USER_NOT_FOUND');
      }

      return user;
    } catch (error) {
      if (error.message !== 'USER_NOT_FOUND') {
        loggerWithFields({ tag: tag + '02', error: error.message }).error(
          'failed to find user by ID with password (from user repository)'
        );
      }
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async update(ctx, req) {
    const tag = 'internal.service.user.update.';

    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(ctx, req.id);

      if (!existingUser) {
        loggerWithFields({ tag: tag + '01', userId: req.id }).error('user not found');
        throw new Error('USER_NOT_FOUND');
      }

      // Check if email is being changed and already exists
      if (req.email && req.email !== existingUser.email) {
        const emailUser = await this.userRepository.findByEmail(ctx, req.email);
        if (emailUser && emailUser._id.toString() !== req.id) {
          loggerWithFields({ tag: tag + '02', email: req.email }).error(
            'email already exists'
          );
          throw new Error('EMAIL_FOUND');
        }
      }

      const user = await this.userRepository.update(ctx, req);

      return user;
    } catch (error) {
      if (error.message !== 'USER_NOT_FOUND' && error.message !== 'EMAIL_FOUND') {
        loggerWithFields({ tag: tag + '03', error: error.message }).error(
          'failed to update user (from user repository)'
        );
      }
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(ctx, id) {
    const tag = 'internal.service.user.delete.';

    try {
      // Check if user exists first
      const user = await this.userRepository.findById(ctx, id);

      if (!user) {
        loggerWithFields({ tag: tag + '01', userId: id }).error('user not found');
        throw new Error('USER_NOT_FOUND');
      }

      await this.userRepository.delete(ctx, id);

      return true;
    } catch (error) {
      if (error.message !== 'USER_NOT_FOUND') {
        loggerWithFields({ tag: tag + '02', error: error.message }).error(
          'failed to delete user (from user repository)'
        );
      }
      throw error;
    }
  }
}

/**
 * Factory function to create UserService instance
 */
function NewUserService(userRepository) {
  return new UserService(userRepository);
}

module.exports = {
  IUserService,
  UserService,
  NewUserService,
};
