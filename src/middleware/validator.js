const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware untuk handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    
    throw new ApiError(400, 'Validation Error', true, JSON.stringify(errorMessages));
  }
  
  next();
};

module.exports = validate;
