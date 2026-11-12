const express = require('express');
const router = express.Router();
const {
  getB2BProducts,
  getB2BProductBySlugOrId,
  createB2BProduct,
  updateB2BProduct,
  deleteB2BProduct,
  createB2BInquiry,
  getB2BInquiries,
  updateB2BInquiryStatus,
  getB2BStats
} = require('../controllers/b2b.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

// Public B2B routes
router.get('/products', getB2BProducts);
router.get('/products/:idOrSlug', getB2BProductBySlugOrId);
router.post('/inquiries', createB2BInquiry);

// Admin-only B2B management routes
router.post('/products', protect, requireAdmin, createB2BProduct);
router.put('/products/:id', protect, requireAdmin, updateB2BProduct);
router.delete('/products/:id', protect, requireAdmin, deleteB2BProduct);
router.get('/inquiries', protect, requireAdmin, getB2BInquiries);
router.patch('/inquiries/:id/status', protect, requireAdmin, updateB2BInquiryStatus);
router.get('/stats', protect, requireAdmin, getB2BStats);

module.exports = router;
