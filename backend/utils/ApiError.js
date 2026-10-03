/**
 * Custom Operational Error Class for Centralized Error Handling
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad Request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized access. Please log in.') {
    return new ApiError(401, msg);
  }

  static paymentRequired(msg = 'Payment or subscription required.') {
    return new ApiError(402, msg);
  }

  static forbidden(msg = 'Access forbidden.') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found.') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Resource conflict.') {
    return new ApiError(409, msg);
  }

  static internal(msg = 'Internal Server Error.') {
    return new ApiError(500, msg);
  }
}
