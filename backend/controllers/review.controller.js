const Review = require('../models/review.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// Helper to recalculate average rating & review count for a product
const updateProductRatingStats = async (productId) => {
  if (!productId) return;

  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingAverage: 5.0,
      reviewCount: 0
    });
  }
};

// @desc    Get featured customer reviews for homepage
// @route   GET /api/v1/reviews/featured
// @access  Public
const getFeaturedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(8);

    return ApiResponse.send(res, 200, { reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/v1/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [reviews, totalCount] = await Promise.all([
      Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments({ product: productId })
    ]);

    return ApiResponse.send(
      res,
      200,
      { reviews },
      'Product reviews fetched',
      {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a product
// @route   POST /api/v1/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment, title, city } = req.body;

    if (!rating || !comment) {
      return next(new ApiError(400, 'Rating and comment are required'));
    }

    let productDoc = null;
    if (productId) {
      productDoc = await Product.findById(productId);
      if (!productDoc) {
        return next(new ApiError(404, 'Product not found'));
      }
    }

    const review = await Review.create({
      product: productId || null,
      user: req.user._id,
      userName: req.user.name,
      city: city || (req.user.addresses && req.user.addresses[0]?.city) || '',
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: true
    });

    if (productId) {
      await updateProductRatingStats(productId);
    }

    return ApiResponse.send(res, 201, { review }, 'Review submitted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new ApiError(404, 'Review not found'));
    }

    const productId = review.product;
    await review.deleteOne();

    if (productId) {
      await updateProductRatingStats(productId);
    }

    return ApiResponse.send(res, 200, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeaturedReviews,
  getProductReviews,
  createReview,
  deleteReview
};
