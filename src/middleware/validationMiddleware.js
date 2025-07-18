// Update src/middleware/validationMiddleware.js

const ApiError = require('../utils/ApiError');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // Special handling for query parameters - convert types before validation
    if (property === 'query') {
      // Convert string numbers to actual numbers for page and limit
      if (req.query.page) {
        req.query.page = parseInt(req.query.page) || 1;
      }
      if (req.query.limit) {
        req.query.limit = parseInt(req.query.limit) || 10;
      }
      
      // Convert boolean strings to actual booleans for isActive
      if (req.query.isActive !== undefined) {
        if (req.query.isActive === 'true') {
          req.query.isActive = true;
        } else if (req.query.isActive === 'false') {
          req.query.isActive = false;
        } else if (req.query.isActive === '') {
          delete req.query.isActive; // Remove empty string
        }
      }
      
      // Remove empty string values from query params
      Object.keys(req.query).forEach(key => {
        if (req.query[key] === '') {
          delete req.query[key];
        }
      });
    }

    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false, // Don't allow unknown fields
      convert: true // Convert types when possible
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return next(ApiError.badRequest('Validation failed', errors));
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

// Validate request body
const validateBody = (schema) => validate(schema, 'body');

// Validate query parameters
const validateQuery = (schema) => validate(schema, 'query');

// Validate URL parameters
const validateParams = (schema) => validate(schema, 'params');

// Validate headers
const validateHeaders = (schema) => validate(schema, 'headers');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders
};