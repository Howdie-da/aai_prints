const multer = require('multer');
const ApiError = require('../utils/apiError.util');

// Use in-memory buffer storage so no temp files linger on disk
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'image/jfif'
];

const fileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(mime)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, GIF, AVIF, SVG.`
      ),
      false
    );
  }
};

const limits = {
  fileSize: 10 * 1024 * 1024 // 10 MB per image limit
};

const upload = multer({
  storage,
  fileFilter,
  limits
});

// Allowed Video MIME types
const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/mpeg',
  'video/ogg',
  'video/3gpp'
];

const videoFileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  if (ALLOWED_VIDEO_MIME_TYPES.includes(mime) || mime.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Unsupported video file type: ${file.mimetype}. Allowed types: MP4, WebM, MOV.`
      ),
      false
    );
  }
};

const videoLimits = {
  fileSize: 100 * 1024 * 1024 // 100 MB per video limit
};

const videoUpload = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: videoLimits
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
  uploadFields: (fields) => handleUpload(upload.fields(fields)),
  uploadVideoSingle: (fieldName = 'video') => handleUpload(videoUpload.single(fieldName))
};
