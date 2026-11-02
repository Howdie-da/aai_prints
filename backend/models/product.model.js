const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      trim: true,
      default: ''
    },
    name: {
      type: String,
      required: [true, 'Variant name is required'],
      trim: true
    },
    attributes: {
      size: { type: String, trim: true },
      finish: { type: String, trim: true },
      color: { type: String, trim: true },
      material: { type: String, trim: true }
    },
    price: {
      type: Number,
      required: [true, 'Variant price is required'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: null
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    image: {
      type: String,
      default: null
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true
    },
    badges: {
      type: [String],
      default: []
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
      default: null
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    images: {
      type: [String],
      default: []
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    dispatchTimeInfo: {
      type: String,
      default: 'Ready to Dispatch within 24-48 Hours'
    },
    hasVariants: {
      type: Boolean,
      default: false
    },
    variants: [variantSchema],
    defaultVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    ratingAverage: {
      type: Number,
      default: 5.0,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating cannot exceed 5.0']
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0
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

// Indexes for fast querying & search
productSchema.index({ category: 1, isActive: 1, isDeleted: 1 });
productSchema.index({ basePrice: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Auto-calculate discount percentage before saving
productSchema.pre('save', function () {
  if (this.originalPrice && this.originalPrice > this.basePrice) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.basePrice) / this.originalPrice) * 100
    );
  } else {
    this.discountPercent = 0;
  }

  // Set defaultVariantId if variants exist and not set
  if (this.hasVariants && this.variants.length > 0 && !this.defaultVariantId) {
    this.defaultVariantId = this.variants[0]._id;
  }
});

module.exports = mongoose.model('Product', productSchema);
