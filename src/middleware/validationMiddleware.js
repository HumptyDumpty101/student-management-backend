// Update src/middleware/validationMiddleware.js

const ApiError = require('../utils/ApiError');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // Skip body validation for GET requests when body is empty or undefined
    if (property === 'body' && req.method === 'GET') {
      return next();
    }
    
    // Skip body validation when there's no body or body is empty
    if (property === 'body' && (!req.body || Object.keys(req.body).length === 0)) {
      return next();
    }

    // Special handling for query parameters - convert types before validation
    if (property === 'query') {
      // Remove empty string values from query params first
      Object.keys(req.query).forEach(key => {
        if (req.query[key] === '' || req.query[key] === null || req.query[key] === undefined) {
          delete req.query[key];
        }
      });

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
        }
      }
    }

    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: property === 'query', // Allow unknown fields for query params, but not for body
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