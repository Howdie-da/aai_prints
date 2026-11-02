const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index automatically cleans up expired tokens
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true
    },
    revokedAt: {
      type: Date,
      default: null
    },
    replacedByToken: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    ip: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

refreshTokenSchema.methods.isExpired = function () {
  return Date.now() >= this.expiresAt.getTime();
};

refreshTokenSchema.methods.isActive = function () {
  return !this.revoked && !this.isExpired();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
