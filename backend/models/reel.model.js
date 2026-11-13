const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Reel title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: ''
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Attached product is required']
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
      default: ''
    },
    duration: {
      type: Number,
      default: 0
    },
    aspectRatio: {
      type: String,
      default: '9:16'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    viewsCount: {
      type: Number,
      default: 0
    },
    likesCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

reelSchema.index({ isActive: 1, order: 1 });
reelSchema.index({ product: 1 });

module.exports = mongoose.model('Reel', reelSchema);
