const express = require('express');
const router = express.Router();

const {
  uploadSingle,
  uploadMultiple,
  deleteMedia,
  getPresignedSignature
} = require('../controllers/media.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  uploadSingle: multerSingle,
  uploadArray: multerArray
} = require('../middlewares/upload.middleware');

// All media management endpoints are protected and restricted to Admin
router.use(protect, authorize('admin'));

// Upload single image (field name: 'image')
router.post('/upload', multerSingle('image'), uploadSingle);

// Upload multiple images (field name: 'images', max 8 images)
router.post('/upload-multiple', multerArray('images', 8), uploadMultiple);

// Delete an asset from Cloudinary by publicId
router.delete('/', deleteMedia);

// Generate presigned signature for direct browser uploads
router.get('/signature', getPresignedSignature);

module.exports = router;
