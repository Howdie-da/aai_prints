const {
  uploadStream,
  deleteAsset,
  generateUploadSignature
} = require('../utils/cloudinary.util');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// @desc    Upload a single image to Cloudinary
// @route   POST /api/v1/media/upload
// @access  Private/Admin
const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please select a file to upload'));
    }

    const folder = req.body.folder || 'aai_prints/products';
    const result = await uploadStream(req.file.buffer, { folder });

    return ApiResponse.send(res, 201, { asset: result }, 'Image uploaded successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple images to Cloudinary (e.g., product gallery)
// @route   POST /api/v1/media/upload-multiple
// @access  Private/Admin
const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, 'Please select at least one file to upload'));
    }

    const folder = req.body.folder || 'aai_prints/products';

    const uploadPromises = req.files.map((file) =>
      uploadStream(file.buffer, { folder })
    );

    const assets = await Promise.all(uploadPromises);

    return ApiResponse.send(
      res,
      201,
      {
        count: assets.length,
        assets
      },
      'Images uploaded successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an asset from Cloudinary
// @route   DELETE /api/v1/media
// @access  Private/Admin
const deleteMedia = async (req, res, next) => {
  try {
    let publicId = req.query.publicId || req.body?.publicId;
    const resourceType = req.query.resourceType || req.body?.resourceType || 'image';

    // If a full Cloudinary URL was provided instead of publicId, extract publicId
    if (!publicId && (req.query.url || req.body?.url)) {
      const url = req.query.url || req.body?.url;
      const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      if (matches && matches[1]) {
        publicId = matches[1];
      }
    }

    if (!publicId) {
      return next(new ApiError(400, 'Cloudinary public_id or valid image URL is required'));
    }

    const result = await deleteAsset(publicId, resourceType);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return next(new ApiError(400, `Failed to delete asset from Cloudinary: ${result.result}`));
    }

    return ApiResponse.send(res, 200, { result, publicId }, 'Asset deleted from Cloudinary');
  } catch (error) {
    next(error);
  }
};

// @desc    Get presigned upload signature for direct browser -> Cloudinary uploads
// @route   GET /api/v1/media/signature
// @access  Private/Admin
const getPresignedSignature = async (req, res, next) => {
  try {
    const { folder = 'aai_prints/products' } = req.query;
    const signatureData = generateUploadSignature({ folder });

    return ApiResponse.send(
      res,
      200,
      signatureData,
      'Upload signature generated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a single video to Cloudinary
// @route   POST /api/v1/media/upload-video
// @access  Private/Admin
const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please select a video file to upload'));
    }

    const folder = req.body.folder || 'aai_prints/reels';
    const result = await uploadStream(req.file.buffer, {
      folder,
      resource_type: 'video'
    });

    // Cloudinary auto-generates high-res poster image for any uploaded video
    let posterUrl = result.url;
    if (posterUrl && posterUrl.includes('/upload/')) {
      posterUrl = posterUrl.replace(/\.[^/.]+$/, '.jpg');
    }

    return ApiResponse.send(
      res,
      201,
      {
        asset: {
          ...result,
          thumbnailUrl: posterUrl
        }
      },
      'Video uploaded successfully to Cloudinary'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadVideo,
  deleteMedia,
  getPresignedSignature
};
