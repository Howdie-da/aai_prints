const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const Coupon = require('../models/coupon.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// Atomic stock decrement with auto-rollback on insufficient inventory
const decrementStockAtomically = async (orderItems) => {
  const decrementedItems = [];
  try {
    for (const item of orderItems) {
      let updateResult;
      if (item.variantId) {
        updateResult = await Product.updateOne(
          {
            _id: item.product,
            'variants._id': item.variantId,
            'variants.stock': { $gte: item.quantity }
          },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      } else {
        updateResult = await Product.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity }
          },
          { $inc: { stock: -item.quantity } }
        );
      }

      if (updateResult.modifiedCount === 0) {
        throw new Error(
          `Insufficient stock for "${item.name}${item.variantName ? ` - ${item.variantName}` : ''}". It may have just sold out.`
        );
      }
      decrementedItems.push(item);
    }
    return true;
  } catch (err) {
    // Rollback any items that were decremented before the failure
    for (const item of decrementedItems) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.product, 'variants._id': item.variantId },
          { $inc: { 'variants.$.stock': item.quantity } }
        ).catch(() => null);
      } else {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } }
        ).catch(() => null);
      }
    }
    throw err;
  }
};

// Helper to restock items for cancelled or refunded orders
const restockOrderItems = async (orderItems) => {
  for (const item of orderItems) {
    if (item.variantId) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variantId },
        { $inc: { 'variants.$.stock': item.quantity } }
      ).catch(() => null);
    } else {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } }
      ).catch(() => null);
    }
  }
};

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

    // Auto-prune dead/deleted products from cart
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product && !item.product.isDeleted && item.product.isActive
    );
    if (cart.items.length !== initialItemCount) {
      await cart.save();
    }

    if (cart.items.length === 0) {
      return next(new ApiError(400, 'Your cart is empty or the items in it are no longer available'));
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const product = item.product;
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
  let appliedCoupon = null;
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

    // Auto-prune dead/deleted products from cart
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product && !item.product.isDeleted && item.product.isActive
    );
    if (cart.items.length !== initialItemCount) {
      await cart.save();
    }

    if (cart.items.length === 0) {
      return next(new ApiError(400, 'All items in your cart are no longer available'));
    }

    let subtotal = 0;
    const orderItems = [];

    // 1. Verify stock and prepare order items
    for (const item of cart.items) {
      const product = item.product;
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

    // 2. Atomic Coupon calculation and increment
    let discount = 0;
    if (couponCode) {
      const couponDoc = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true
      });
      if (!couponDoc) {
        return next(new ApiError(400, 'Invalid coupon code'));
      }
      const check = couponDoc.isValid(subtotal);
      if (!check.valid) {
        return next(new ApiError(400, check.message));
      }

      // Atomically check usage limit and increment
      const updatedCoupon = await Coupon.findOneAndUpdate(
        {
          _id: couponDoc._id,
          $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
          ]
        },
        { $inc: { usedCount: 1 } },
        { new: true }
      );

      if (!updatedCoupon) {
        return next(new ApiError(400, 'Coupon usage limit has been reached'));
      }
      discount = couponDoc.calculateDiscount(subtotal);
      appliedCoupon = couponDoc.code;
    }

    const FREE_SHIPPING_THRESHOLD = 500;
    const STANDARD_SHIPPING_FEE = 49;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = Math.max(0, subtotal - discount + shippingFee);

    // 3. Two-Phase Payment & Stock Allocation:
    // COD decrements stock immediately and clears cart.
    // Online payments (Razorpay) initialize order in pending state; stock is decremented and cart cleared upon payment capture.
    let isStockDecremented = false;
    if (paymentMethod === 'cod') {
      try {
        await decrementStockAtomically(orderItems);
        isStockDecremented = true;
      } catch (err) {
        if (appliedCoupon) {
          await Coupon.updateOne({ code: appliedCoupon }, { $inc: { usedCount: -1 } }).catch(() => null);
        }
        return next(new ApiError(409, err.message));
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
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      isStockDecremented
    });

    // 5. Clear cart if COD (or for Razorpay, cart will be cleared on payment confirmation)
    if (paymentMethod === 'cod') {
      cart.items = [];
      await cart.save();
    }

    return ApiResponse.send(res, 201, { order }, 'Order placed successfully');
  } catch (error) {
    if (appliedCoupon) {
      await Coupon.updateOne({ code: appliedCoupon }, { $inc: { usedCount: -1 } }).catch(() => null);
    }
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
      // If cancelling an order, restock items only if stock was decremented
      if (status === 'cancelled' && order.status !== 'cancelled') {
        if (order.isStockDecremented) {
          await restockOrderItems(order.items);
          order.isStockDecremented = false;
        }
        if (order.pricing?.couponCode) {
          await Coupon.updateOne(
            { code: order.pricing.couponCode },
            { $inc: { usedCount: -1 } }
          ).catch(() => null);
        }
        order.cancelledAt = new Date();
        order.cancelReason = cancelReason || 'Cancelled by admin';
      }

      // If confirming an order where stock was deferred (e.g. online checkout)
      if (
        (status === 'confirmed' || status === 'processing') &&
        !order.isStockDecremented &&
        order.status !== 'cancelled'
      ) {
        await decrementStockAtomically(order.items);
        order.isStockDecremented = true;
        await Cart.updateOne({ user: order.user }, { $set: { items: [] } }).catch(() => null);
      }

      order.status = status;
    }

    if (paymentStatus) {
      // When payment is marked paid, ensure stock is decremented and cart cleared
      if (paymentStatus === 'paid' && !order.isStockDecremented && order.status !== 'cancelled') {
        await decrementStockAtomically(order.items);
        order.isStockDecremented = true;
        await Cart.updateOne({ user: order.user }, { $set: { items: [] } }).catch(() => null);
      }
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
