const Reel = require('../models/reel.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// @desc    Get all active reels (for homepage showcase)
// @route   GET /api/v1/reels
// @access  Public
const getReels = async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };

    const reels = await Reel.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .populate({
        path: 'product',
        select: '_id name slug price basePrice originalPrice image images category stock inStock ratingAverage reviewCount tags badges shortDescription'
      });

    return ApiResponse.send(res, 200, {
      count: reels.length,
      reels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reel by ID
// @route   GET /api/v1/reels/:id
// @access  Public
const getReelById = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id).populate({
      path: 'product',
      select: '_id name slug price basePrice originalPrice image images category stock inStock ratingAverage reviewCount tags badges shortDescription'
    });

    if (!reel) {
      return next(new ApiError(404, 'Reel not found'));
    }

    return ApiResponse.send(res, 200, { reel });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new reel
// @route   POST /api/v1/reels
// @access  Private/Admin
const createReel = async (req, res, next) => {
  try {
    const { title, videoUrl, thumbnailUrl, product, caption, duration, order, isActive } = req.body;

    // Verify product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return next(new ApiError(404, 'Referenced product not found'));
    }

    const reel = await Reel.create({
      title,
      videoUrl,
      thumbnailUrl: thumbnailUrl || existingProduct.image || '',
      product,
      caption,
      duration: duration || 0,
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    const populatedReel = await Reel.findById(reel._id).populate({
      path: 'product',
      select: '_id name slug price basePrice originalPrice image images category stock inStock ratingAverage reviewCount tags badges'
    });

    return ApiResponse.send(res, 201, { reel: populatedReel }, 'Reel created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update reel
// @route   PUT /api/v1/reels/:id
// @access  Private/Admin
const updateReel = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) {
      return next(new ApiError(404, 'Reel not found'));
    }

    if (req.body.product) {
      const productExists = await Product.findById(req.body.product);
      if (!productExists) {
        return next(new ApiError(404, 'Referenced product not found'));
      }
    }

    const updatedReel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate({
      path: 'product',
      select: '_id name slug price basePrice originalPrice image images category stock inStock ratingAverage reviewCount tags badges'
    });

    return ApiResponse.send(res, 200, { reel: updatedReel }, 'Reel updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete reel
// @route   DELETE /api/v1/reels/:id
// @access  Private/Admin
const deleteReel = async (req, res, next) => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) {
      return next(new ApiError(404, 'Reel not found'));
    }

    return ApiResponse.send(res, 200, null, 'Reel deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Track reel view
// @route   PATCH /api/v1/reels/:id/view
// @access  Public
const trackReelView = async (req, res, next) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );

    if (!reel) {
      return next(new ApiError(404, 'Reel not found'));
    }

    return ApiResponse.send(res, 200, { viewsCount: reel.viewsCount });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel,
  trackReelView
};
