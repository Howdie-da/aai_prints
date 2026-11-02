const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getProducts,
  getInstantSearch,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Public
router.get('/', getProducts);
router.get('/search/instant', getInstantSearch);
router.get('/:slug', getProductBySlug);

// Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Product description is required'),
    body('category').notEmpty().withMessage('Category ID is required'),
    body('basePrice').isNumeric().withMessage('Base price must be a valid number')
  ],
  validate,
  createProduct
);

router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
