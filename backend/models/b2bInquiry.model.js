const mongoose = require('mongoose');

const b2bInquiryItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'B2BProduct',
      default: null
    },
    productName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    estimatedUnitPrice: {
      type: Number,
      default: null
    }
  },
  { _id: true }
);

const b2bInquirySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company / Organization name is required'],
      trim: true
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone / WhatsApp number is required'],
      trim: true
    },
    gstin: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      required: [true, 'Delivery city is required'],
      trim: true
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    inquiryType: {
      type: String,
      enum: ['bulk_order', 'custom_branding', 'sample_request', 'distributor_dealership'],
      default: 'bulk_order',
      index: true
    },
    items: {
      type: [b2bInquiryItemSchema],
      default: []
    },
    targetBudget: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['new', 'in_review', 'quoted', 'fulfilled', 'cancelled'],
      default: 'new',
      index: true
    },
    quotedAmount: {
      type: Number,
      default: 0
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

b2bInquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('B2BInquiry', b2bInquirySchema);
