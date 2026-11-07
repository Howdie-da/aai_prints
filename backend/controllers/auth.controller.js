const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const Wishlist = require('../models/wishlist.model');
const RefreshToken = require('../models/refreshToken.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies
} = require('../utils/jwt.util');

// Helper to create session and save refresh token in database
const createSessionAndRespond = async (user, statusCode, req, res, message = 'Success') => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token in MongoDB (valid for 7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt,
    userAgent: req.headers['user-agent'] || null,
    ip: req.ip || req.connection.remoteAddress || null
  });

  // Set httpOnly cookies
  setAuthCookies(res, accessToken, refreshToken);

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
    data: {
      user: userSafe,
      accessToken,
      refreshToken
    }
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ApiError(409, 'An account with this email address already exists.'));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || null,
      role: 'customer'
    });

    // Initialize empty Cart and Wishlist for user
    await Cart.create({ user: user._id, items: [] });
    await Wishlist.create({ user: user._id, products: [] });

    return await createSessionAndRespond(user, 201, req, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & issue access + refresh tokens
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Please provide both email and password.'));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    if (!user.isActive) {
      return next(new ApiError(403, 'Your account has been deactivated.'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    return await createSessionAndRespond(user, 200, req, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Rotate refresh token and issue new access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (requires valid refresh token in cookie or body)
const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return next(new ApiError(401, 'Refresh token is missing'));
    }

    // Verify token cryptographic signature
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      clearAuthCookies(res);
      return next(new ApiError(401, 'Refresh token has expired or is invalid. Please log in again.'));
    }

    // Look up refresh token in MongoDB
    const tokenDoc = await RefreshToken.findOne({ token: incomingRefreshToken });

    // Handle token reuse detection (possible token theft)
    if (!tokenDoc) {
      // Token doesn't exist in DB at all
      clearAuthCookies(res);
      return next(new ApiError(401, 'Refresh token is not recognized. Session revoked.'));
    }

    if (tokenDoc.revoked) {
      // Check if this request falls within the rotation grace period (30 seconds)
      // and was legitimately rotated into a successor token (handles multi-tab/concurrent refreshes)
      const GRACE_PERIOD_MS = 30 * 1000;
      const isWithinGrace =
        tokenDoc.revokedAt &&
        Date.now() - new Date(tokenDoc.revokedAt).getTime() <= GRACE_PERIOD_MS;

      if (isWithinGrace && tokenDoc.replacedByToken) {
        const replacementDoc = await RefreshToken.findOne({
          token: tokenDoc.replacedByToken
        });

        if (replacementDoc && !replacementDoc.revoked && !replacementDoc.isExpired()) {
          const user = await User.findById(tokenDoc.user);
          if (user && user.isActive) {
            const freshAccessToken = generateAccessToken(user);
            setAuthCookies(res, freshAccessToken, replacementDoc.token);
            return ApiResponse.send(
              res,
              200,
              {
                accessToken: freshAccessToken,
                refreshToken: replacementDoc.token
              },
              'Access token refreshed successfully (session grace window)'
            );
          }
        }
      }

      // Beyond grace period or without a valid replacement -> TRUE TOKEN REUSE DETECTED: Revoke all tokens!
      await RefreshToken.updateMany(
        { user: decoded.id },
        { $set: { revoked: true, revokedAt: new Date() } }
      );
      clearAuthCookies(res);
      return next(
        new ApiError(403, 'Compromised session detected. All sessions have been logged out for security.')
      );
    }

    if (tokenDoc.isExpired()) {
      tokenDoc.revoked = true;
      tokenDoc.revokedAt = new Date();
      await tokenDoc.save();
      clearAuthCookies(res);
      return next(new ApiError(401, 'Refresh token has expired. Please log in again.'));
    }

    // Verify user is active
    const user = await User.findById(tokenDoc.user);
    if (!user || !user.isActive) {
      clearAuthCookies(res);
      return next(new ApiError(401, 'User account no longer exists or is deactivated.'));
    }

    // ROTATE REFRESH TOKEN: Revoke old token & generate new pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    tokenDoc.revoked = true;
    tokenDoc.revokedAt = new Date();
    tokenDoc.replacedByToken = newRefreshToken;
    await tokenDoc.save();

    // Save new refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({
      user: user._id,
      token: newRefreshToken,
      expiresAt,
      userAgent: req.headers['user-agent'] || null,
      ip: req.ip || req.connection.remoteAddress || null
    });

    // Update cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    return ApiResponse.send(
      res,
      200,
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      },
      'Access token refreshed successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user & revoke refresh token
// @route   POST /api/v1/auth/logout
// @access  Public / Private
const logout = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;

    if (incomingRefreshToken) {
      await RefreshToken.updateOne(
        { token: incomingRefreshToken },
        { $set: { revoked: true, revokedAt: new Date() } }
      );
    }

    clearAuthCookies(res);
    return ApiResponse.send(res, 200, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Log out from all devices
// @route   POST /api/v1/auth/logout-all
// @access  Private
const logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.updateMany(
      { user: req.user._id, revoked: false },
      { $set: { revoked: true, revokedAt: new Date() } }
    );

    clearAuthCookies(res);
    return ApiResponse.send(res, 200, null, 'Logged out from all devices successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return ApiResponse.send(res, 200, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    return ApiResponse.send(res, 200, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/v1/auth/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, street, landmark, city, state, postalCode, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      fullName,
      phone,
      street,
      landmark: landmark || '',
      city,
      state,
      postalCode,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();
    return ApiResponse.send(res, 201, { addresses: user.addresses }, 'Address added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/v1/auth/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();
    return ApiResponse.send(res, 200, { addresses: user.addresses }, 'Address removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress
};
