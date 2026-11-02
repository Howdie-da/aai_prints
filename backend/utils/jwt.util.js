const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieExpiresDays = parseInt(process.env.COOKIE_EXPIRES_DAYS, 10) || 7;

  return {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken({
    id: user._id,
    role: user.role
  });

  const cookieOptions = getCookieOptions();
  res.cookie('token', token, cookieOptions);

  // Exclude password from user object
  const userSafe = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    addresses: user.addresses || [],
    createdAt: user.createdAt
  };

  return res.status(statusCode).json({
    success: true,
    message,
    token, // Also provided in payload for clients/tools that prefer header auth
    data: {
      user: userSafe
    }
  });
};

const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    expires: new Date(0)
  });
};

module.exports = {
  signToken,
  verifyToken,
  getCookieOptions,
  sendTokenResponse,
  clearAuthCookie
};
