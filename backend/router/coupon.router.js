const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Public validation
router.post(
  '/validate',
  [body('code').trim().notEmpty().withMessage('Coupon code is required')],
  validate,
  validateCoupon
);

// Admin routes
router.use(protect, authorize('admin'));
router.get('/', getCoupons);
router.post(
  '/',
  [
    body('code').trim().notEmpty().withMessage('Coupon code is required'),
    body('discountAmount').isNumeric().withMessage('Discount amount must be a number')
  ],
  validate,
  createCoupon
);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
