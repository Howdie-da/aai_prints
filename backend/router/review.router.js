const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getFeaturedReviews,
  getProductReviews,
  createReview,
  deleteReview
} = require('../controllers/review.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Public
router.get('/featured', getFeaturedReviews);
router.get('/product/:productId', getProductReviews);

// Protected (Customer)
router.post(
  '/',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required')
  ],
  validate,
  createReview
);

// Admin
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
