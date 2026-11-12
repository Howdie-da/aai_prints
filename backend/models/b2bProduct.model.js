const mongoose = require('mongoose');

const tierPricingSchema = new mongoose.Schema(
  {
    minQty: {
      type: Number,
      required: [true, 'Minimum quantity for tier is required'],
      min: [1, 'Minimum quantity must be at least 1']
    },
    maxQty: {
      type: Number,
      default: null // null indicates "and above" (e.g., 100+)
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price for tier is required'],
      min: [0, 'Unit price cannot be negative']
    }
  },
  { _id: false }
);

const b2bProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'B2B Product name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'B2B Category is required'],
      enum: [
        'Corporate Gifting',
        'Hotel & Temple Decor',
        'Bulk Wall Art',
        'Reseller Packs',
        'Custom Brass Crafts',
        'Car Decor Master Packs',
        'Festive Combos'
      ],
      default: 'Corporate Gifting',
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Wholesale unit price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    basePrice: {
      type: Number,
      default: 0
    },
    moq: {
      type: Number,
      required: [true, 'Minimum Order Quantity (MOQ) is required'],
      min: [1, 'MOQ must be at least 1'],
      default: 25
    },
    samplePrice: {
      type: Number,
      default: null
    },
    tierPricing: {
      type: [tierPricingSchema],
      default: []
    },
    casePack: {
      type: String,
      default: 'Standard Pack',
      trim: true
    },
    leadTime: {
      type: String,
      default: 'Ready to Dispatch',
      trim: true
    },
    customBrandingAvailable: {
      type: Boolean,
      default: false
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    images: {
      type: [String],
      required: [true, 'At least one product photo is required'],
      validate: {
        validator: function (v) {
          return (
            Array.isArray(v) &&
            v.length > 0 &&
            v.some((img) => typeof img === 'string' && img.trim().length > 0)
          );
        },
        message: 'At least one product photo is required'
      }
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      default: 500,
      min: [0, 'Stock cannot be negative']
    },
    hsnCode: {
      type: String,
      default: '4420',
      trim: true
    },
    gstRate: {
      type: Number,
      default: 12,
      min: 0,
      max: 28
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for primary image
b2bProductSchema.virtual('image').get(function () {
  return (this.images && this.images.length > 0) ? this.images[0] : '';
});

// Virtual for starting bulk unit price (lowest tier price or first tier price)
b2bProductSchema.virtual('startingPrice').get(function () {
  if (this.tierPricing && this.tierPricing.length > 0) {
    const prices = this.tierPricing.map((t) => t.unitPrice);
    return Math.min(...prices);
  }
  return 0;
});

// Virtual for highest tier price (price at MOQ)
b2bProductSchema.virtual('moqPrice').get(function () {
  if (this.tierPricing && this.tierPricing.length > 0) {
    return this.tierPricing[0].unitPrice;
  }
  return 0;
});

b2bProductSchema.index({ category: 1, isActive: 1, isDeleted: 1 });
b2bProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('B2BProduct', b2bProductSchema);
