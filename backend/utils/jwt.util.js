const jwt = require('jsonwebtoken');

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev_access_secret';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    getAccessSecret(),
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    getRefreshSecret(),
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

const getCookieOptions = (maxAgeMs) => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    expires: new Date(Date.now() + maxAgeMs),
    maxAge: maxAgeMs,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
  const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  res.cookie('accessToken', accessToken, getCookieOptions(ACCESS_TOKEN_EXPIRY_MS));
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, getCookieOptions(REFRESH_TOKEN_EXPIRY_MS));
  }
};

const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    expires: new Date(0)
  };

  res.cookie('accessToken', '', clearOptions);
  res.cookie('refreshToken', '', clearOptions);
  // Also clear legacy cookie name if present
  res.cookie('token', '', clearOptions);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies
};
