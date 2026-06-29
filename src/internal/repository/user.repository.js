/**
 * User Repository
 * Data access layer for User entity
 * Handles all database operations related to users
 */

const { loggerWithFields } = require('../../pkg/logger/logger');
const { PaginationResponse } = require('../rest/response/base.response');

/**
 * User Repository Interface
 * Defines contract for user data access operations
 */
class IUserRepository {
  async show(ctx, req) {
    throw new Error('Method not implemented');
  }

  async create(ctx, req) {
    throw new Error('Method not implemented');
  }

  async findByEmail(ctx, email) {
    throw new Error('Method not implemented');
  }

  async findById(ctx, id) {
    throw new Error('Method not implemented');
  }

  async update(ctx, req) {
    throw new Error('Method not implemented');
  }

  async delete(ctx, id) {
    throw new Error('Method not implemented');
  }

  async findByVerificationToken(ctx, token) {
    throw new Error('Method not implemented');
  }

  async findByResetToken(ctx, token) {
    throw new Error('Method not implemented');
  }
}

/**
 * User Repository Implementation
 */
class UserRepository extends IUserRepository {
  constructor(UserModel, appConfig) {
    super();
    this.UserModel = UserModel;
    this.appConfig = appConfig;
  }

  /**
   * Show users with pagination and filtering
   */
  async show(ctx, req) {
    const tag = 'internal.repository.user.show.';

    try {
      const query = {};

      // Apply filters
      if (req.id) {
        query._id = req.id;
      }
      if (req.email) {
        query.email = req.email;
      }
      if (req.search) {
        query.$or = [
          { name: { $regex: req.search, $options: 'i' } },
          { email: { $regex: req.search, $options: 'i' } },
        ];
      }

      // Count total items if not disabled
      let total = 0;
      if (req.disableCalculateTotal !== 'true') {
        total = await this.UserModel.countDocuments(query);
      }

      // Build query with sorting
      let dbQuery = this.UserModel.find(query);

      // Apply sorting
      if (req.field && req.sort) {
        const sortOrder = req.sort.toLowerCase() === 'asc' ? 1 : -1;
        dbQuery = dbQuery.sort({ [req.field]: sortOrder });
      } else {
        dbQuery = dbQuery.sort({ createdAt: -1 });
      }

      // Apply pagination
      if (req.page > 0 && req.limit > 0) {
        const offset = (req.page - 1) * req.limit;
        dbQuery = dbQuery.skip(offset).limit(req.limit);
      }

      const users = await dbQuery.exec();

      // Calculate total pages
      const totalPages = req.limit > 0 ? Math.ceil(total / req.limit) : 0;

      return new PaginationResponse(users, total, totalPages, req.page, req.limit);
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to get users from database'
      );
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(ctx, req) {
    const tag = 'internal.repository.user.create.';

    try {
      const user = await this.UserModel.create({
        name: req.name,
        email: req.email,
        password: req.password,
        role: req.role || 'user',
      });

      return user;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to create user in database'
      );
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(ctx, email) {
    const tag = 'internal.repository.user.findByEmail.';

    try {
      const user = await this.UserModel.findOne({ email });
      return user;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to find user by email'
      );
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(ctx, id) {
    const tag = 'internal.repository.user.findById.';

    try {
      const user = await this.UserModel.findById(id);
      return user;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to find user by ID'
      );
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(ctx, req) {
    const tag = 'internal.repository.user.update.';

    try {
      const user = await this.UserModel.findById(req.id);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Update fields
      if (req.name) user.name = req.name;
      if (req.email) user.email = req.email;
      if (req.role) user.role = req.role;

      await user.save();
      return user;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to update user in database'
      );
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  async delete(ctx, id) {
    const tag = 'internal.repository.user.delete.';

    try {
      const result = await this.UserModel.findByIdAndDelete(id);

      if (!result) {
        throw new Error('USER_NOT_FOUND');
      }

      return true;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to delete user from database'
      );
      throw error;
    }
  }

  /**
   * Find user by email verification token
   */
  async findByVerificationToken(ctx, token) {
    const tag = 'internal.repository.user.findByVerificationToken.';

    try {
      const user = await this.UserModel.findOne({
        emailVerificationToken: token,
      });
      return user;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to find user by verification token'
      );
      throw error;
    }
  }

  /**
   * Find user by password reset token
   */
  async findByResetToken(ctx, token) {
    const tag = 'internal.repository.user.findByResetToken.';

    try {
      const user = await this.UserModel.findOne({
        resetPasswordToken: token,
      });
      return user;
    } catch (error) {
      loggerWithFields({ tag: tag + '01', error: error.message }).error(
        'failed to find user by reset token'
      );
      throw error;
    }
  }
}

/**
 * Factory function to create UserRepository instance
 */
function NewUserRepository(UserModel, appConfig) {
  return new UserRepository(UserModel, appConfig);
}

module.exports = {
  IUserRepository,
  UserRepository,
  NewUserRepository,
};
