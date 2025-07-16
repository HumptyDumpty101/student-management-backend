const ApiError = require('../utils/ApiError');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
      allowUnknown: false // Don't allow unknown fields
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