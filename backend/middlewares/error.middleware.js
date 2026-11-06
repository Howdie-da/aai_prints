const ApiError = require('../utils/apiError.util');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, normalize it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || err.http_code || (error.status && !isNaN(error.status) ? error.status : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // Always log 500 errors to console for rapid debugging
  if (error.statusCode >= 500) {
    console.error(`[Error 500 on ${req.method} ${req.originalUrl}]:`, err.message);
    if (err.stack) console.error(err.stack);
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    error = new ApiError(404, message);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate value '${value}' entered for ${field}. Please use another value.`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    const message = messages.map((m) => m.message).join('. ') || 'Database validation error';
    error = new ApiError(400, message, messages);
  }

  // Handle JWT Malformed / Signature errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
