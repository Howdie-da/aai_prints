const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const slugify = require('../utils/slugify.util');

// @desc    Get all categories (nested with subcategories)
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { flat } = req.query;

    if (flat === 'true') {
      const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
      return ApiResponse.send(res, 200, { categories });
    }

    // Top-level categories (parentCategory = null) with their subcategories populated
    const categories = await Category.find({ parentCategory: null, isActive: true })
      .sort({ order: 1, name: 1 })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { order: 1, name: 1 } }
      });

    return ApiResponse.send(res, 200, { categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug.toLowerCase(),
      isActive: true
    }).populate('subcategories');

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    return ApiResponse.send(res, 200, { category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentCategory, order } = req.body;

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      return next(new ApiError(409, 'Category with this name or slug already exists'));
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || null,
      parentCategory: parentCategory || null,
      order: order || 0
    });

    return ApiResponse.send(res, 201, { category }, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentCategory, order, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    if (name && name !== category.name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return ApiResponse.send(res, 200, { category }, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Check if products exist in this category
    const productsCount = await Product.countDocuments({
      category: category._id,
      isDeleted: false
    });

    if (productsCount > 0) {
      return next(
        new ApiError(
          400,
          `Cannot delete category. There are ${productsCount} active products associated with it.`
        )
      );
    }

    category.isActive = false;
    await category.save();

    return ApiResponse.send(res, 200, null, 'Category deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
