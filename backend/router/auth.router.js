const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Public routes
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

// Refresh Token route (supports token in httpOnly cookie or body)
router.post('/refresh-token', refreshAccessToken);

// Logout current session
router.post('/logout', logout);

// Protected routes
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post(
  '/addresses',
  protect,
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('street').notEmpty().withMessage('Street address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('postalCode').notEmpty().withMessage('Postal code is required')
  ],
  validate,
  addAddress
);
router.delete('/addresses/:addressId', protect, deleteAddress);

module.exports = router;
