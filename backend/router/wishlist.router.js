const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlist.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

router.use(protect);

router.get('/', getWishlist);
router.post(
  '/toggle',
  [body('productId').notEmpty().withMessage('Product ID is required')],
  validate,
  toggleWishlist
);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

module.exports = router;
