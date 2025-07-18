const ApiError = require('../utils/ApiError');
const {logger} = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = {...err};
    error.message = err.message || "Something went wrong";

    logger.error('Error caught in error handler:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        ...(err.statusCode && { statusCode: err.statusCode })
    });

    // mongoose bad objectId
    if(err.name === 'CastError') {
        const message  = `Resource not found`
        error = ApiError.badRequest(message);
    }

    // mongoose duplicate key
    if(err.code === 11000) {
        const message = `Duplicate field value entered`;
        error = ApiError.conflict(message);
    }

    // mongoose validation error
    if(err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = ApiError.badRequest(`Validation Error: ${message}`);
    }

    // JWT Errors
    if(err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = ApiError.unauthorized(message);
    }
    if(err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = ApiError.unauthorized(message);
    }

    // Multer errors
    if(err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File size limit exceeded';
        error = ApiError.badRequest(message);
    }
    if(err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Unexpected file';
        error = ApiError.badRequest(message);
    }

    // Default to 500 server error
    if(!error.statusCode) {
        error = ApiError.internal();
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(error.errors && { errors: error.errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }); 
}

module.exports = errorHandler;