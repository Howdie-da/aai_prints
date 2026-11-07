const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  name: {
    type: String,
    required: true
  },
  variantName: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: null
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true }
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, default: null },
      shippingFee: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 }
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      default: 'razorpay'
    },
    // Tracks whether physical inventory has been decremented for this order
    isStockDecremented: {
      type: Boolean,
      default: false
    },
    // Razorpay transaction details (placeholder for when Razorpay is enabled)
    paymentDetails: {
      razorpayOrderId: { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
      razorpaySignature: { type: String, default: null },
      paidAt: { type: Date, default: null }
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
