const cloudinary = require('cloudinary').v2;
const streamifier = require('stream');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload a file buffer directly to Cloudinary using upload_stream
 * @param {Buffer} fileBuffer - In-memory file buffer from multer
 * @param {Object} options - Upload options (folder, public_id, transformation, etc.)
 * @returns {Promise<Object>} Formatted asset details
 */
const uploadStream = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultFolder = process.env.CLOUDINARY_FOLDER || 'aai_prints';
    const uploadOptions = {
      folder: options.folder || defaultFolder,
      resource_type: options.resource_type || 'auto',
      ...options
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve({
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resource_type,
        createdAt: result.created_at
      });
    });

    const readable = new streamifier.Readable();
    readable._read = () => {};
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

/**
 * Delete a media asset from Cloudinary by public ID
 * @param {string} publicId - Cloudinary public_id
 * @param {string} resourceType - 'image', 'video', or 'raw'
 * @returns {Promise<Object>}
 */
const deleteAsset = async (publicId, resourceType = 'image') => {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });
};

/**
 * Generate a signed upload signature for direct browser-to-Cloudinary uploads
 * Eliminates server memory bottlenecks during high-resolution media uploads
 * @param {Object} paramsToSign - Parameters to include in the signature
 * @returns {Object} Signature, timestamp, apiKey, and cloudName
 */
const generateUploadSignature = (paramsToSign = {}) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = paramsToSign.folder || process.env.CLOUDINARY_FOLDER || 'aai_prints';

  const params = {
    timestamp,
    folder,
    ...paramsToSign
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  };
};

module.exports = {
  cloudinary,
  uploadStream,
  deleteAsset,
  generateUploadSignature
};
