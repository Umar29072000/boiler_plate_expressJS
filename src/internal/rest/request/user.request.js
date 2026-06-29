/**
 * User Request DTOs
 * Data Transfer Objects for user-related requests
 * Handles validation and request parsing
 */

/**
 * Get User Request DTO
 * Used for listing users with pagination and filtering
 */
class GetUserRequest {
  constructor(query) {
    this.page = query.page || '1';
    this.limit = query.limit || '10';
    this.field = query.field || '';
    this.sort = query.sort || '';
    this.search = query.search || '';
    this.disableCalculateTotal = query.disableCalculateTotal || 'false';
    this.id = query.id || '';
    this.email = query.email || '';
  }

  validate() {
    const errors = [];

    // Validate page
    if (this.page && isNaN(parseInt(this.page))) {
      errors.push({ field: 'page', message: 'Page must be a number' });
    }

    // Validate limit
    if (this.limit && isNaN(parseInt(this.limit))) {
      errors.push({ field: 'limit', message: 'Limit must be a number' });
    }

    // Validate sort
    if (this.sort && !['asc', 'desc', 'ASC', 'DESC'].includes(this.sort)) {
      errors.push({ field: 'sort', message: 'Sort must be asc or desc' });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Update Profile Request DTO
 */
class UpdateProfileRequest {
  constructor(body) {
    this.name = body.name || '';
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (this.name && this.name.length > 50) {
      errors.push({ field: 'name', message: 'Name cannot exceed 50 characters' });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

/**
 * Delete User Request DTO
 */
class DeleteUserRequest {
  constructor(params) {
    this.id = params.id || '';
  }

  validate() {
    const errors = [];

    if (!this.id || this.id.trim() === '') {
      errors.push({ field: 'id', message: 'User ID is required' });
    }

    if (errors.length > 0) {
      throw { errors };
    }

    return true;
  }
}

module.exports = {
  GetUserRequest,
  UpdateProfileRequest,
  DeleteUserRequest,
};
