/**
 * Base Response Structure
 * Standardized response format for all API endpoints
 */

class BaseResponse {
  constructor(code, message, data = null) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

class PaginationResponse {
  constructor(items, totalItems, totalPages, page, limit) {
    this.items = items;
    this.totalItems = totalItems;
    this.totalPages = totalPages;
    this.page = page;
    this.limit = limit;
  }
}

module.exports = {
  BaseResponse,
  PaginationResponse,
};
