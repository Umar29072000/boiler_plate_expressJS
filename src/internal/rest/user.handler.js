/**
 * User Handler
 * HTTP request handlers for user-related endpoints
 * Depends on UserService for business logic
 */

const { loggerWithFields } = require('../../pkg/logger/logger');
const { BaseResponse } = require('./response/base.response');
const {
  GetUserRequest,
  UpdateProfileRequest,
  DeleteUserRequest,
} = require('./request/user.request');

/**
 * User Handler Class
 */
class UserHandler {
  constructor(userService) {
    this.userService = userService;
  }

  /**
   * Get user profile
   * @route GET /api/v1/users/profile
   */
  async getProfile(req, res) {
    const tag = 'internal.rest.user.getProfile.';

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
        new BaseResponse(200, 'SUCCESS', user)
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '02', error: error.message }).error(
        'failed to get user profile (from user service)'
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
   * Get all users with pagination
   * @route GET /api/v1/users
   */
  async getAllUsers(req, res) {
    const tag = 'internal.rest.user.getAllUsers.';

    try {
      // Parse and validate request
      const request = new GetUserRequest(req.query);
      
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

      // Convert page and limit to integers
      const page = parseInt(request.page) || 1;
      const limit = parseInt(request.limit) || 10;

      // Call service
      const userData = await this.userService.show(req, {
        page,
        limit,
        field: request.field,
        sort: request.sort,
        search: request.search,
        disableCalculateTotal: request.disableCalculateTotal,
        id: request.id,
        email: request.email,
      });

      return res.status(200).json(
        new BaseResponse(200, 'SUCCESS', userData)
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '02', error: error.message }).error(
        'failed to get users (from user service)'
      );

      return res.status(500).json(
        new BaseResponse(500, 'INTERNAL_SERVER_ERROR', null)
      );
    }
  }

  /**
   * Update user profile
   * @route PUT /api/v1/users/profile
   */
  async updateProfile(req, res) {
    const tag = 'internal.rest.user.updateProfile.';

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

      // Get current user to preserve other fields
      const currentUser = await this.userService.findById(req, userId);

      if (!currentUser) {
        loggerWithFields({ tag: tag + '03', userId }).error('user not found');
        return res.status(404).json(
          new BaseResponse(404, 'USER_NOT_FOUND', null)
        );
      }

      // Update user
      const userData = await this.userService.update(req, {
        id: userId,
        name: request.name,
        email: currentUser.email,
        role: currentUser.role,
      });

      return res.status(200).json(
        new BaseResponse(200, 'SUCCESS', userData)
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '04', error: error.message }).error(
        'failed to update user profile (from user service)'
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
   * Delete user
   * @route DELETE /api/v1/users/:id
   */
  async deleteUser(req, res) {
    const tag = 'internal.rest.user.deleteUser.';

    try {
      // Parse and validate request
      const request = new DeleteUserRequest(req.params);

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

      await this.userService.delete(req, request.id);

      return res.status(200).json(
        new BaseResponse(200, 'SUCCESS', null)
      );
    } catch (error) {
      loggerWithFields({ tag: tag + '02', error: error.message }).error(
        'failed to delete user (from user service)'
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
}

/**
 * Initialize User Handler Routes
 * Wires up routes with handler methods
 */
function InitUserHandler(router, userService, authMiddleware) {
  const handler = new UserHandler(userService);

  // Bind methods to preserve 'this' context
  router.get('/users/profile', authMiddleware, handler.getProfile.bind(handler));
  router.get('/users', authMiddleware, handler.getAllUsers.bind(handler));
  router.put('/users/profile', authMiddleware, handler.updateProfile.bind(handler));
  router.delete('/users/:id', authMiddleware, handler.deleteUser.bind(handler));

  return router;
}

module.exports = {
  UserHandler,
  InitUserHandler,
};
