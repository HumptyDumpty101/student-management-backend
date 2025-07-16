class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.message = message;
        this.errors = errors;

        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // Static Methods for common error responses
    static badRequest(message = "Bad request", errors = []) {
        return new ApiError(400, message, errors);
    }

    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message, errors);
    }

    static forbidden(message = "Forbidden") {
        return new ApiError(403, message, errors);
    }

    static notFound(message = "Not found") {
        return new ApiError(404, message, errors);
    }

    static conflict(message = "Conflict", errors = []) {
        return new ApiError(409, message, errors);
    }

    static internal(message = "Internal server error", errors = []) {
        return new ApiError(500, message, errors);
    }
}

module.exports = ApiError;