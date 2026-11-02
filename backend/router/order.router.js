const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getCheckoutPreview,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.use(protect);

// Customer checkout & orders
router.post('/checkout-preview', getCheckoutPreview);
router.post(
  '/',
  [body('shippingAddress').isObject().withMessage('Shipping address is required')],
  validate,
  createOrder
);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

// Admin routes
router.get('/', authorize('admin'), getAllOrders);
router.put(
  '/:id/status',
  authorize('admin'),
  [
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status')
  ],
  validate,
  updateOrderStatus
);

module.exports = router;
