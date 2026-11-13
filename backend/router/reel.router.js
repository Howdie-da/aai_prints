const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel,
  trackReelView
} = require('../controllers/reel.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

// Public routes
router.get('/', getReels);
router.get('/:id', getReelById);
router.patch('/:id/view', trackReelView);

// Admin routes
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Reel title is required'),
    body('videoUrl').trim().notEmpty().withMessage('Video URL is required'),
    body('product').isMongoId().withMessage('Valid product ID is required')
  ],
  validate,
  createReel
);

router.put('/:id', protect, authorize('admin'), updateReel);
router.delete('/:id', protect, authorize('admin'), deleteReel);

module.exports = router;
