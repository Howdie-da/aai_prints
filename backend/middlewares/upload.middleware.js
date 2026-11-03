const multer = require('multer');
const ApiError = require('../utils/apiError.util');

// Use in-memory buffer storage so no temp files linger on disk
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml'
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, AVIF, SVG.`
      ),
      false
    );
  }
};

const limits = {
  fileSize: 10 * 1024 * 1024 // 10 MB per file limit
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

/**
 * Middleware wrapper to catch Multer errors and format them with ApiError
 */
const handleUpload = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'File size exceeds 10MB limit'));
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ApiError(400, `Unexpected field name for file upload: ${err.field}`));
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle: (fieldName = 'image') => handleUpload(upload.single(fieldName)),
  uploadArray: (fieldName = 'images', maxCount = 5) => handleUpload(upload.array(fieldName, maxCount)),
  uploadFields: (fields) => handleUpload(upload.fields(fields))
};
