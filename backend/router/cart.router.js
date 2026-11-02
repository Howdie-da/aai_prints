const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
} = require('../controllers/cart.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// All cart actions require authenticated user
router.use(protect);

router.get('/', getCart);
router.post(
  '/items',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be an integer >= 1')
  ],
  validate,
  addItemToCart
);
router.put(
  '/items/:itemId',
  [body('quantity').isInt().withMessage('Quantity must be an integer')],
  validate,
  updateCartItemQuantity
);
router.delete('/items/:itemId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
