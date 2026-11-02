const Coupon = require('../models/coupon.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// @desc    Validate coupon code and calculate discount
// @route   POST /api/v1/coupons/validate
// @access  Public
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return next(new ApiError(400, 'Coupon code is required'));
    }

    const orderSubtotal = Number(subtotal) || 0;
    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });

    if (!coupon) {
      return next(new ApiError(404, 'Invalid coupon code'));
    }

    const validity = coupon.isValid(orderSubtotal);
    if (!validity.valid) {
      return next(new ApiError(400, validity.message));
    }

    const discount = coupon.calculateDiscount(orderSubtotal);

    return ApiResponse.send(
      res,
      200,
      {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
        discount,
        finalSubtotal: orderSubtotal - discount
      },
      'Coupon applied successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Private/Admin
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return ApiResponse.send(res, 200, { coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon
// @route   POST /api/v1/coupons
// @access  Private/Admin
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountAmount,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      expiresAt
    } = req.body;

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return next(new ApiError(409, 'Coupon code already exists'));
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description: description || '',
      discountType: discountType || 'fixed',
      discountAmount: Number(discountAmount),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      expiresAt: expiresAt || null
    });

    return ApiResponse.send(res, 201, { coupon }, 'Coupon created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return next(new ApiError(404, 'Coupon not found'));
    }

    Object.assign(coupon, req.body);
    if (req.body.code) {
      coupon.code = req.body.code.trim().toUpperCase();
    }

    await coupon.save();
    return ApiResponse.send(res, 200, { coupon }, 'Coupon updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return next(new ApiError(404, 'Coupon not found'));
    }

    await coupon.deleteOne();
    return ApiResponse.send(res, 200, null, 'Coupon deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
};
