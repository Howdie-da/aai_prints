const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// @desc    Get user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      match: { isActive: true, isDeleted: false },
      select: 'name slug basePrice originalPrice discountPercent images inStock ratingAverage reviewCount badges'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    return ApiResponse.send(res, 200, {
      count: wishlist.products.length,
      products: wishlist.products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (Add if absent, Remove if present)
// @route   POST /api/v1/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return next(new ApiError(400, 'Product ID is required'));
    }

    const product = await Product.findOne({ _id: productId, isActive: true, isDeleted: false });
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const existingIndex = wishlist.products.findIndex(
      (p) => p.toString() === productId.toString()
    );

    let isAdded = false;
    if (existingIndex > -1) {
      // Remove product
      wishlist.products.splice(existingIndex, 1);
      isAdded = false;
    } else {
      // Add product
      wishlist.products.push(productId);
      isAdded = true;
    }

    await wishlist.save();

    await wishlist.populate({
      path: 'products',
      select: 'name slug basePrice originalPrice discountPercent images inStock ratingAverage reviewCount badges'
    });

    return ApiResponse.send(
      res,
      200,
      {
        isAdded,
        count: wishlist.products.length,
        products: wishlist.products
      },
      isAdded ? 'Added to wishlist' : 'Removed from wishlist'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: productId } },
      { new: true }
    ).populate({
      path: 'products',
      select: 'name slug basePrice originalPrice discountPercent images inStock ratingAverage reviewCount badges'
    });

    return ApiResponse.send(
      res,
      200,
      {
        count: wishlist.products.length,
        products: wishlist.products
      },
      'Product removed from wishlist'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in wishlist
// @route   DELETE /api/v1/wishlist
// @access  Private
const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $set: { products: [] } },
      { new: true }
    );

    return ApiResponse.send(
      res,
      200,
      { count: 0, products: [] },
      'Wishlist cleared'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  clearWishlist
};
