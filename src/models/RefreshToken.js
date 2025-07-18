const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  createdByIp: {
    type: String,
    required: true
  },
  revokedAt: {
    type: Date
  },
  revokedByIp: {
    type: String
  },
  replacedByToken: {
    type: String
  }
}, {
  timestamps: true
});

// Index for cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance methods
refreshTokenSchema.methods.isExpired = function() {
  return Date.now() >= this.expiresAt.getTime();
};

refreshTokenSchema.methods.isActive = function() {
  return !this.revokedAt && !this.isExpired();
};

refreshTokenSchema.methods.revoke = function(ipAddress, replacedByToken) {
  this.revokedAt = new Date();
  this.revokedByIp = ipAddress;
  this.replacedByToken = replacedByToken;
  return this.save();
};

// Static methods
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, ipAddress) {
  await this.updateMany(
    { user: userId, revokedAt: { $exists: false } },
    { 
      revokedAt: new Date(),
      revokedByIp: ipAddress 
    }
  );
};

refreshTokenSchema.statics.cleanupExpiredTokens = async function() {
  await this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);

