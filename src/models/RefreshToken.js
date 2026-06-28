const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    createdByIp: {
      type: String,
    },
    revokedAt: {
      type: Date,
    },
    revokedByIp: {
      type: String,
    },
    replacedByToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if token is expired
refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual to check if token is active (not revoked and not expired)
refreshTokenSchema.virtual('isActive').get(function () {
  return !this.revokedAt && !this.isExpired;
});

// Instance method to check if active
refreshTokenSchema.methods.isActive = function () {
  return !this.revokedAt && Date.now() < this.expiresAt;
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpiredTokens = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result.deletedCount;
};

// Hash token before saving
refreshTokenSchema.pre('save', function (next) {
  if (this.isModified('token')) {
    this.token = crypto.createHash('sha256').update(this.token).digest('hex');
  }
  next();
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
