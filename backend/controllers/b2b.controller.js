const B2BProduct = require('../models/b2bProduct.model');
const B2BInquiry = require('../models/b2bInquiry.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');
const slugify = require('../utils/slugify.util');

/**
 * @desc    Get all active B2B products with filters & pagination
 * @route   GET /api/v1/b2b/products
 * @access  Public
 */
const getB2BProducts = async (req, res, next) => {
  try {
    const { category, search, minMoq, maxMoq, sort = 'createdAt', page = 1, limit = 50 } = req.query;

    const query = { isActive: true, isDeleted: false };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (minMoq || maxMoq) {
      query.moq = {};
      if (minMoq) query.moq.$gte = Number(minMoq);
      if (maxMoq) query.moq.$lte = Number(maxMoq);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'moq_asc') sortOptions = { moq: 1 };
    if (sort === 'moq_desc') sortOptions = { moq: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [rawProducts, total] = await Promise.all([
      B2BProduct.find(query).sort(sortOptions).skip(skip).limit(Number(limit)),
      B2BProduct.countDocuments(query)
    ]);

    const products = rawProducts.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      const unitPrice = obj.price != null ? obj.price : (obj.tierPricing?.[0]?.unitPrice || 0);
      return {
        ...obj,
        price: unitPrice,
        basePrice: unitPrice
      };
    });

    return ApiResponse.send(
      res,
      200,
      { products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
      'B2B products fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single B2B product by Slug or ObjectId
 * @route   GET /api/v1/b2b/products/:idOrSlug
 * @access  Public
 */
const getB2BProductBySlugOrId = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await B2BProduct.findOne({ _id: idOrSlug, isDeleted: false });
    } else {
      product = await B2BProduct.findOne({ slug: idOrSlug.toLowerCase(), isDeleted: false });
    }

    if (!product) {
      return next(new ApiError(404, 'B2B product not found'));
    }

    return ApiResponse.send(res, 200, { product }, 'B2B product retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new B2B Product
 * @route   POST /api/v1/b2b/products
 * @access  Private (Admin)
 */
const createB2BProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      moq,
      price,
      wholesalePrice,
      specifications,
      images,
      stock
    } = req.body;

    const unitPrice = Number(
      price != null
        ? price
        : wholesalePrice != null
        ? wholesalePrice
        : req.body.tierPricing?.[0]?.unitPrice || 0
    );

    if (!name || !description || !category || (!unitPrice && unitPrice !== 0) || !images || images.length === 0) {
      return next(
        new ApiError(400, 'Please provide all required fields: name, description, category, price, and at least one image.')
      );
    }

    let slug = slugify(name);
    let existing = await B2BProduct.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const minOrderQty = Math.max(1, Number(moq) || 1);

    const newProduct = await B2BProduct.create({
      name,
      slug,
      description,
      category,
      price: unitPrice,
      basePrice: unitPrice,
      moq: minOrderQty,
      samplePrice: req.body.samplePrice ? Number(req.body.samplePrice) : null,
      tierPricing: req.body.tierPricing || [{ minQty: minOrderQty, maxQty: null, unitPrice }],
      specifications: specifications || {},
      images,
      stock: stock ? Number(stock) : 500,
      isActive: true
    });

    return ApiResponse.send(res, 201, { product: newProduct }, 'Wholesale product created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing B2B Product
 * @route   PUT /api/v1/b2b/products/:id
 * @access  Private (Admin)
 */
const updateB2BProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.name) {
      updates.slug = slugify(updates.name);
    }

    if (updates.price != null) {
      updates.price = Number(updates.price);
      updates.basePrice = updates.price;
      if (!updates.tierPricing || updates.tierPricing.length === 0) {
        updates.tierPricing = [{ minQty: Number(updates.moq) || 1, maxQty: null, unitPrice: updates.price }];
      }
    }

    const product = await B2BProduct.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return next(new ApiError(404, 'Wholesale product not found'));
    }

    return ApiResponse.send(res, 200, { product }, 'Wholesale product updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete a B2B product
 * @route   DELETE /api/v1/b2b/products/:id
 * @access  Private (Admin)
 */
const deleteB2BProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await B2BProduct.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!product) {
      return next(new ApiError(404, 'B2B product not found'));
    }

    return ApiResponse.send(res, 200, { id: product._id }, 'B2B product deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a new B2B Quotation / Bulk Inquiry / Sample Request
 * @route   POST /api/v1/b2b/inquiries
 * @access  Public
 */
const createB2BInquiry = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      gstin,
      city,
      state,
      inquiryType,
      items,
      targetBudget,
      notes
    } = req.body;

    if (!companyName || !contactPerson || !email || !phone || !city) {
      return next(new ApiError(400, 'Company name, contact person, email, phone, and city are required.'));
    }

    const inquiry = await B2BInquiry.create({
      companyName,
      contactPerson,
      email,
      phone,
      gstin: gstin || '',
      city,
      state: state || '',
      inquiryType: inquiryType || 'bulk_order',
      items: Array.isArray(items) ? items : [],
      targetBudget: targetBudget || '',
      notes: notes || '',
      status: 'new'
    });

    return ApiResponse.send(
      res,
      201,
      { inquiry },
      'Your wholesale inquiry has been submitted. Our enterprise desk will contact you within 24 business hours.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all B2B inquiries / RFQs (Admin)
 * @route   GET /api/v1/b2b/inquiries
 * @access  Private (Admin)
 */
const getB2BInquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [inquiries, total] = await Promise.all([
      B2BInquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      B2BInquiry.countDocuments(query)
    ]);

    return ApiResponse.send(
      res,
      200,
      { inquiries, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
      'B2B inquiries fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update B2B Inquiry status / quote (Admin)
 * @route   PATCH /api/v1/b2b/inquiries/:id/status
 * @access  Private (Admin)
 */
const updateB2BInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, quotedAmount, adminNotes } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (quotedAmount !== undefined) updates.quotedAmount = Number(quotedAmount);
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const inquiry = await B2BInquiry.findByIdAndUpdate(id, updates, { new: true });

    if (!inquiry) {
      return next(new ApiError(404, 'B2B inquiry not found'));
    }

    return ApiResponse.send(res, 200, { inquiry }, 'Inquiry status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get B2B overview statistics (Admin)
 * @route   GET /api/v1/b2b/stats
 * @access  Private (Admin)
 */
const getB2BStats = async (req, res, next) => {
  try {
    const [totalProducts, newInquiries, totalInquiries] = await Promise.all([
      B2BProduct.countDocuments({ isActive: true, isDeleted: false }),
      B2BInquiry.countDocuments({ status: 'new' }),
      B2BInquiry.countDocuments()
    ]);

    return ApiResponse.send(
      res,
      200,
      { totalProducts, newInquiries, totalInquiries },
      'B2B stats retrieved'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getB2BProducts,
  getB2BProductBySlugOrId,
  createB2BProduct,
  updateB2BProduct,
  deleteB2BProduct,
  createB2BInquiry,
  getB2BInquiries,
  updateB2BInquiryStatus,
  getB2BStats
};
