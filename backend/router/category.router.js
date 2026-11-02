const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Public
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  createCategory
);

router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
