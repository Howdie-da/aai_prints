const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'itemModel',
      required: [true, 'Product is required']
    },
    itemModel: {
      type: String,
      enum: ['Product', 'B2BProduct'],
      default: 'Product'
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    }
  },
  {
    timestamps: true
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Cart', cartSchema);
