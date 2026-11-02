const { verifyToken } = require('../utils/jwt.util');
const ApiError = require('../utils/apiError.util');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check httpOnly cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication required. Please log in.'));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Verify user still exists in database and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ApiError(401, 'User account associated with this session no longer exists.'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Account is deactivated. Please contact support.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid authentication token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Authentication token has expired. Please log in again.'));
    }
    return next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied. You do not have permission for this resource.'));
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
