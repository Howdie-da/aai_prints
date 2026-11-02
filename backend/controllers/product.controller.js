const Product = require('../models/product.model');
const Category = require('../models/category.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const slugify = require('../utils/slugify.util');

// @desc    Get filtered, sorted & paginated products
// @route   GET /api/v1/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      badge,
      minPrice,
      maxPrice,
      inStock,
      sort = 'featured',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true, isDeleted: false };

    // 1. Category filter (by ID or Slug, resolving subcategories if parent)
    if (category) {
      let catDoc = null;
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        catDoc = await Category.findById(category);
      } else {
        catDoc = await Category.findOne({ slug: category.toLowerCase() });
      }

      if (catDoc) {
        // Find any subcategories under this parent
        const subCats = await Category.find({ parentCategory: catDoc._id });
        const catIds = [catDoc._id, ...subCats.map((sc) => sc._id)];
        query.category = { $in: catIds };
      }
    }

    // 2. Search query filter
    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // 3. Badge filter (e.g. 'BEST SELLER', 'NEW ARRIVAL')
    if (badge) {
      query.badges = badge.toUpperCase();
    }

    // 4. In-Stock filter
    if (inStock === 'true') {
      query.inStock = true;
    }

    // 5. Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.basePrice = {};
      if (minPrice !== undefined && !isNaN(minPrice)) {
        query.basePrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        query.basePrice.$lte = Number(maxPrice);
      }
    }

    // 6. Sorting logic
    let sortOption = {};
    switch (sort) {
      case 'price-asc':
        sortOption = { basePrice: 1 };
        break;
      case 'price-desc':
        sortOption = { basePrice: -1 };
        break;
      case 'rating':
        sortOption = { ratingAverage: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'featured':
      default:
        sortOption = { ratingAverage: -1, createdAt: -1 };
        break;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return ApiResponse.send(
      res,
      200,
      { products },
      'Products fetched successfully',
      {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Fast instant search autocomplete for header search modal
// @route   GET /api/v1/products/search/instant
// @access  Public
const getInstantSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return ApiResponse.send(res, 200, { matches: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const matches = await Product.find({
      name: { $regex: regex },
      isActive: true,
      isDeleted: false
    })
      .select('name slug basePrice originalPrice images category')
      .populate('category', 'name slug')
      .limit(6);

    return ApiResponse.send(res, 200, {
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/v1/products/:slug
// @access  Public
const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug.toLowerCase(),
      isActive: true,
      isDeleted: false
    }).populate('category', 'name slug parentCategory');

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    return ApiResponse.send(res, 200, { product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (with optional variants)
// @route   POST /api/v1/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      badges,
      basePrice,
      originalPrice,
      images,
      inStock,
      stock,
      dispatchTimeInfo,
      hasVariants,
      variants
    } = req.body;

    const slug = slugify(name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      return next(new ApiError(409, 'Product with this title or slug already exists'));
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return next(new ApiError(400, 'Invalid category ID specified'));
    }

    const productData = {
      name,
      slug,
      description,
      category,
      badges: badges || [],
      basePrice,
      originalPrice: originalPrice || null,
      images: images || [],
      inStock: inStock !== undefined ? inStock : true,
      stock: stock || 10,
      dispatchTimeInfo: dispatchTimeInfo || 'Ready to Dispatch within 24-48 Hours',
      hasVariants: Boolean(hasVariants && variants && variants.length > 0),
      variants: variants || []
    };

    const product = await Product.create(productData);
    return ApiResponse.send(res, 201, { product }, 'Product created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
      return next(new ApiError(404, 'Product not found'));
    }

    const updates = req.body;
    if (updates.name && updates.name !== product.name) {
      updates.slug = slugify(updates.name);
    }

    if (updates.variants && updates.variants.length > 0) {
      updates.hasVariants = true;
    }

    Object.assign(product, updates);
    await product.save();

    return ApiResponse.send(res, 200, { product }, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    return ApiResponse.send(res, 200, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getInstantSearch,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
};
