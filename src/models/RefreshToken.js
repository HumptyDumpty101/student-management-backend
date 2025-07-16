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
        default: () => Date.now() + (process.env.JWT_REFRESH_TOKEN_EXPIRY ? parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY) * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000) // Default to 7 days
    },
    createdByIp: {
        type: String,
        default: null
    },
    revokedAt: {
        type: Date,
        default: null
    },
    revokedByIp: {
        type: String,
        default: null
    },
    replacedByToken: {
        type: String,
        default: null
    }
},
{
    timestamps: true
})

// Index for expired token cleanup
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Check if the token is expired
refreshTokenSchema.methods.isExpired = function() {
    return this.expiresAt.getTime() <= new Date.now();
};

// Check if the token is active (not revoked and not expired)
refreshTokenSchema.methods.isActive = function() {
    return !this.revokedAt && !this.isExpired();
}

// Revoke the token
refreshTokenSchema.methods.revoke = function(ipAddress, replacedByToken) {
    this.revokedAt = new Date();
    this.revokedByIp = ipAddress;
    this.replacedByToken = replacedByToken;
    return this.save();
}

// Static method to revoke all tokens for a user
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, ipAddress) {
    await this.updateMany(
        { user: userId, revokedAt: {$exists: false} },
        { $set: { revokedAt: new Date(), revokedByIp: ipAddress } }
    )
}

// Static method to clean up expired tokens
refreshTokenSchema.statics.cleanUpExpiredTokens = async function() {
    await this.deleteMany({ expiresAt: { $lt: new Date() } });
}