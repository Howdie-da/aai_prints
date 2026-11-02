const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Coupon = require('../models/coupon.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// @desc    Checkout preview (validates cart, checks stock, applies coupon, calculates totals)
// @route   POST /api/v1/orders/checkout-preview
// @access  Private
const getCheckoutPreview = async (req, res, next) => {
  try {
    const { couponCode } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug basePrice originalPrice images stock variants isActive isDeleted'
    });

    if (!cart || cart.items.length === 0) {
      return next(new ApiError(400, 'Your cart is empty'));
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.isDeleted || !product.isActive) {
        return next(new ApiError(400, 'One or more items in your cart are no longer available'));
      }

      let unitPrice = product.basePrice;
      let variantName = null;
      let availableStock = product.stock;

      if (item.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return next(new ApiError(400, `Option for ${product.name} is no longer available`));
        }
        unitPrice = variant.price;
        variantName = variant.name;
        availableStock = variant.stock;
      }

      if (availableStock < item.quantity) {
        return next(
          new ApiError(
            400,
            `Insufficient stock for "${product.name}${variantName ? ` - ${variantName}` : ''}". Only ${availableStock} left.`
          )
        );
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        variantId: item.variantId,
        name: product.name,
        variantName,
        price: unitPrice,
        quantity: item.quantity,
        image: (product.images && product.images[0]) || null,
        itemTotal
      });
    }

    // Coupon calculation
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (coupon) {
        const check = coupon.isValid(subtotal);
        if (check.valid) {
          discount = coupon.calculateDiscount(subtotal);
          appliedCoupon = coupon.code;
        }
      }
    }

    const FREE_SHIPPING_THRESHOLD = 500;
    const STANDARD_SHIPPING_FEE = 49;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = Math.max(0, subtotal - discount + shippingFee);

    return ApiResponse.send(res, 200, {
      items: validatedItems,
      pricing: {
        subtotal,
        discount,
        couponCode: appliedCoupon,
        shippingFee,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        isFreeShippingEligible: subtotal >= FREE_SHIPPING_THRESHOLD,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, couponCode, paymentMethod = 'razorpay' } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
      return next(new ApiError(400, 'Please provide a complete shipping address'));
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug basePrice originalPrice images stock variants isActive isDeleted'
    });

    if (!cart || cart.items.length === 0) {
      return next(new ApiError(400, 'Cannot place order with an empty cart'));
    }

    let subtotal = 0;
    const orderItems = [];

    // 1. Verify stock and prepare order items
    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.isDeleted || !product.isActive) {
        return next(new ApiError(400, `Product is no longer available`));
      }

      let unitPrice = product.basePrice;
      let variantName = null;
      let availableStock = product.stock;

      if (item.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return next(new ApiError(400, `Selected option for ${product.name} not found`));
        }
        unitPrice = variant.price;
        variantName = variant.name;
        availableStock = variant.stock;
      }

      if (availableStock < item.quantity) {
        return next(
          new ApiError(
            400,
            `Insufficient stock for "${product.name}${variantName ? ` - ${variantName}` : ''}".`
          )
        );
      }

      subtotal += unitPrice * item.quantity;
      orderItems.push({
        product: product._id,
        variantId: item.variantId || null,
        name: product.name,
        variantName,
        price: unitPrice,
        quantity: item.quantity,
        image: (product.images && product.images[0]) || null
      });
    }

    // 2. Coupon calculation
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });
      if (coupon) {
        const check = coupon.isValid(subtotal);
        if (check.valid) {
          discount = coupon.calculateDiscount(subtotal);
          appliedCoupon = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    const FREE_SHIPPING_THRESHOLD = 500;
    const STANDARD_SHIPPING_FEE = 49;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = Math.max(0, subtotal - discount + shippingFee);

    // 3. Atomically decrement stock
    for (const item of orderItems) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.product, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      } else {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // 4. Create Order
    const orderNumber = `AAI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        couponCode: appliedCoupon,
        shippingFee,
        total
      },
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      paymentMethod
    });

    // 5. Clear user's cart
    cart.items = [];
    await cart.save();

    return ApiResponse.send(res, 201, { order }, 'Order placed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments({ user: req.user._id })
    ]);

    return ApiResponse.send(res, 200, { orders }, 'Orders retrieved', {
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Guard: only owner or admin can view
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ApiError(403, 'Access denied to this order'));
    }

    return ApiResponse.send(res, 200, { order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/v1/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query)
    ]);

    return ApiResponse.send(res, 200, { orders }, 'All orders fetched', {
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus, cancelReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    if (status) {
      // If cancelling an order, restock items
      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          if (item.variantId) {
            await Product.updateOne(
              { _id: item.product, 'variants._id': item.variantId },
              { $inc: { 'variants.$.stock': item.quantity } }
            );
          } else {
            await Product.updateOne(
              { _id: item.product },
              { $inc: { stock: item.quantity } }
            );
          }
        }
        order.cancelledAt = new Date();
        order.cancelReason = cancelReason || 'Cancelled by admin';
      }
      order.status = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    return ApiResponse.send(res, 200, { order }, 'Order status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCheckoutPreview,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
