const { verifyAccessToken } = require('../utils/jwt.util');
const ApiError = require('../utils/apiError.util');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check httpOnly accessToken cookie
    if (req.cookies && (req.cookies.accessToken || req.cookies.token)) {
      token = req.cookies.accessToken || req.cookies.token;
    }
    // 2. Fallback to Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication required. Please log in.'));
    }

    // Verify access token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const error = new ApiError(401, 'Access token has expired', [{ code: 'TOKEN_EXPIRED' }]);
        return next(error);
      }
      return next(new ApiError(401, 'Invalid authentication token'));
    }

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
    next(error);
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
