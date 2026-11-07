const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews from the same user on the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
