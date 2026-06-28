/**
 * Wrapper untuk async route handlers
 * Automatically catches errors dan pass ke next middleware
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
