const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/apiError.util');
const ApiResponse = require('../utils/apiResponse.util');

// Helper to compute cart totals with live prices & variant resolution
const formatCartResponse = (cart) => {
  let subtotal = 0;
  let totalItemsCount = 0;

  const formattedItems = cart.items
    .filter((item) => item.product && !item.product.isDeleted && item.product.isActive)
    .map((item) => {
      const product = item.product;
      let selectedVariant = null;
      let unitPrice = product.basePrice;
      let originalPrice = product.originalPrice || null;
      let variantName = null;
      let availableStock = product.stock;

      if (item.variantId && product.variants && product.variants.length > 0) {
        selectedVariant = product.variants.id(item.variantId);
        if (selectedVariant) {
          unitPrice = selectedVariant.price;
          originalPrice = selectedVariant.originalPrice || null;
          variantName = selectedVariant.name;
          availableStock = selectedVariant.stock;
        }
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      totalItemsCount += item.quantity;

      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          image: (product.images && product.images[0]) || null
        },
        variantId: item.variantId,
        variantName,
        quantity: item.quantity,
        unitPrice,
        originalPrice,
        itemTotal,
        inStock: availableStock >= item.quantity,
        availableStock
      };
    });

  // Free shipping policy (Free on orders above ₹500, otherwise ₹49 standard)
  const FREE_SHIPPING_THRESHOLD = 500;
  const STANDARD_SHIPPING_FEE = 49;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const total = subtotal + shippingFee;

  return {
    _id: cart._id,
    items: formattedItems,
    summary: {
      subtotal,
      shippingFee,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      isFreeShippingEligible: subtotal >= FREE_SHIPPING_THRESHOLD,
      amountToFreeShipping,
      total,
      totalItemsCount
    }
  };
};

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug basePrice originalPrice images stock variants isActive isDeleted'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Auto-prune any items whose product was deleted or inactivated from DB
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product && !item.product.isDeleted && item.product.isActive
    );
    if (cart.items.length !== initialItemCount) {
      await cart.save();
    }

    const formatted = formatCartResponse(cart);
    return ApiResponse.send(res, 200, { cart: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart (with variant selection)
// @route   POST /api/v1/cart/items
// @access  Private
const addItemToCart = async (req, res, next) => {
  try {
    const { productId, variantId = null, quantity = 1 } = req.body;

    if (!productId) {
      return next(new ApiError(400, 'Product ID is required'));
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return next(new ApiError(400, 'Quantity must be at least 1'));
    }

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true, isDeleted: false });
    if (!product) {
      return next(new ApiError(404, 'Product not found or currently unavailable'));
    }

    // Verify variant if provided or required
    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) {
        return next(new ApiError(404, 'Selected product option/variant does not exist'));
      }
      if (variant.stock < qty) {
        return next(new ApiError(400, `Only ${variant.stock} units available for this option`));
      }
    } else if (product.hasVariants && product.variants.length > 0) {
      // Auto-assign default variant if none specified
      req.body.variantId = product.defaultVariantId || product.variants[0]._id;
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const targetVariantId = req.body.variantId ? req.body.variantId.toString() : null;

    // Check if matching item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (item.variantId ? item.variantId.toString() : null) === targetVariantId
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += qty;
    } else {
      cart.items.push({
        product: productId,
        variantId: targetVariantId || null,
        quantity: qty
      });
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug basePrice originalPrice images stock variants isActive isDeleted'
    });

    const formatted = formatCartResponse(cart);
    return ApiResponse.send(res, 200, { cart: formatted }, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of a cart item
// @route   PUT /api/v1/cart/items/:itemId
// @access  Private
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      return next(new ApiError(400, 'Invalid quantity provided'));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ApiError(404, 'Cart not found'));
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return next(new ApiError(404, 'Cart item not found'));
    }

    if (qty <= 0) {
      // Remove item if quantity reduced to 0
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug basePrice originalPrice images stock variants isActive isDeleted'
    });

    const formatted = formatCartResponse(cart);
    return ApiResponse.send(res, 200, { cart: formatted }, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/v1/cart/items/:itemId
// @access  Private
const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new ApiError(404, 'Cart not found'));
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug basePrice originalPrice images stock variants isActive isDeleted'
    });

    const formatted = formatCartResponse(cart);
    return ApiResponse.send(res, 200, { cart: formatted }, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/v1/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { new: true }
    );

    const formatted = formatCartResponse(cart);
    return ApiResponse.send(res, 200, { cart: formatted }, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart
};
