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
    label: {
      type: String,
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
    inStock: {
      type: Boolean,
      default: true
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

// Pre-save for variant to auto-populate label & inStock
variantSchema.pre('save', function () {
  if (!this.label) {
    this.label = this.name;
  }
  this.inStock = this.stock > 0;
});

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
    subcategory: {
      type: String,
      default: '',
      trim: true,
      index: true
    },
    tag: {
      type: String,
      default: '',
      trim: true
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
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
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
    isTrending: {
      type: Boolean,
      default: false,
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

// Virtuals for 1:1 Frontend Contract Compatibility
productSchema.virtual('price').get(function () {
  return String(this.basePrice);
});

productSchema.virtual('image').get(function () {
  return (this.images && this.images.length > 0) ? this.images[0] : '';
});

productSchema.virtual('availability').get(function () {
  return this.inStock ? 'in_stock' : 'out_of_stock';
});

productSchema.virtual('trending').get(function () {
  return Boolean(this.isTrending);
});

productSchema.virtual('stockCount').get(function () {
  return this.stock;
});

productSchema.virtual('rating').get(function () {
  return this.ratingAverage;
});

productSchema.virtual('reviews').get(function () {
  return this.reviewCount;
});

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

  // Sync tag with badges
  if (this.tag && !this.badges.includes(this.tag)) {
    this.badges.push(this.tag);
  } else if (!this.tag && this.badges.length > 0) {
    this.tag = this.badges[0];
  }

  // Set defaultVariantId if variants exist and not set
  if (this.hasVariants && this.variants.length > 0) {
    this.variants.forEach((v) => {
      if (!v.label) v.label = v.name;
      v.inStock = v.stock > 0;
    });
    if (!this.defaultVariantId) {
      this.defaultVariantId = this.variants[0]._id;
    }
  }
});

module.exports = mongoose.model('Product', productSchema);
