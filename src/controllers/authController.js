const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { logger } = require('../utils/logger');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  setTokenCookie, 
  clearTokenCookie 
} = require('../config/jwtConfig');

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      logger.warn(`Login attempt with invalid email: ${email} from IP: ${clientIp}`);
      return next(ApiError.unauthorized('Invalid credentials'));
    }

    // Check if account is locked
    if (user.isLocked) {
      logger.warn(`Login attempt on locked account: ${email} from IP: ${clientIp}`);
      return next(ApiError.unauthorized('Account is temporarily locked due to too many failed attempts'));
    }

    // Check if account is active
    if (!user.isActive) {
      logger.warn(`Login attempt on inactive account: ${email} from IP: ${clientIp}`);
      return next(ApiError.unauthorized('Account is deactivated'));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for: ${email} from IP: ${clientIp}`);
      
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      return next(ApiError.unauthorized('Invalid credentials'));
    }

    // Reset login attempts on successful login
    if (user.loginAttempts && user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    await user.updateLastLogin();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshTokenValue = generateRefreshToken();

    // Save refresh token to database
    const refreshTokenDoc = new RefreshToken({
      token: refreshTokenValue,
      user: user._id,
      createdByIp: clientIp
    });
    await refreshTokenDoc.save();

    // Set access token in cookie
    setTokenCookie(res, accessToken);

    const userResponse = user.toJSON();
    
    logger.info(`Successful login for user: ${email} from IP: ${clientIp}`);

    return ApiResponse.success(res, {
      user: userResponse,
      refreshToken: refreshTokenValue
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    return next(ApiError.internal('Login failed'));
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    if (!token) {
      return next(ApiError.unauthorized('Refresh token is required'));
    }

    // Find refresh token in database
    const refreshTokenDoc = await RefreshToken.findOne({ token }).populate('user');
    
    if (!refreshTokenDoc) {
      logger.warn(`Invalid refresh token attempt from IP: ${clientIp}`);
      return next(ApiError.unauthorized('Invalid refresh token'));
    }

    // Check if token is active
    if (!refreshTokenDoc.isActive()) {
      logger.warn(`Expired/revoked refresh token attempt from IP: ${clientIp}`);
      return next(ApiError.unauthorized('Refresh token expired or revoked'));
    }

    const user = refreshTokenDoc.user;

    // Check if user is still active
    if (!user || !user.isActive) {
      await refreshTokenDoc.revoke(clientIp);
      return next(ApiError.unauthorized('User account is not active'));
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);
    
    // Generate new refresh token
    const newRefreshTokenValue = generateRefreshToken();
    
    // Revoke old refresh token and create new one
    await refreshTokenDoc.revoke(clientIp, newRefreshTokenValue);
    
    const newRefreshTokenDoc = new RefreshToken({
      token: newRefreshTokenValue,
      user: user._id,
      createdByIp: clientIp
    });
    await newRefreshTokenDoc.save();

    // Set new access token in cookie
    setTokenCookie(res, newAccessToken);

    logger.info(`Token refreshed for user: ${user.email} from IP: ${clientIp}`);

    return ApiResponse.success(res, {
      refreshToken: newRefreshTokenValue
    }, 'Token refreshed successfully');

  } catch (error) {
    logger.error('Token refresh error:', error);
    return next(ApiError.internal('Token refresh failed'));
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Clear access token cookie
    clearTokenCookie(res);

    // If refresh token provided, revoke it
    if (token) {
      const refreshTokenDoc = await RefreshToken.findOne({ token });
      if (refreshTokenDoc && refreshTokenDoc.isActive()) {
        await refreshTokenDoc.revoke(clientIp);
      }
    }

    logger.info(`User logged out from IP: ${clientIp}`);

    return ApiResponse.success(res, null, 'Logged out successfully');

  } catch (error) {
    logger.error('Logout error:', error);
    return next(ApiError.internal('Logout failed'));
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    return ApiResponse.success(res, { user }, 'User data retrieved successfully');

  } catch (error) {
    logger.error('Get current user error:', error);
    return next(ApiError.internal('Failed to get user data'));
  }
};

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return next(ApiError.notFound('User not found'));
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      logger.warn(`Invalid current password attempt by user: ${user.email} from IP: ${clientIp}`);
      return next(ApiError.unauthorized('Current password is incorrect'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens for security
    await RefreshToken.revokeAllUserTokens(userId, clientIp);

    // Clear access token cookie
    clearTokenCookie(res);

    logger.info(`Password changed for user: ${user.email} from IP: ${clientIp}`);

    return ApiResponse.success(res, null, 'Password changed successfully. Please login again.');

  } catch (error) {
    logger.error('Change password error:', error);
    return next(ApiError.internal('Password change failed'));
  }
};

// @desc    Revoke all user tokens (logout from all devices)
// @route   POST /api/v1/auth/logout-all
// @access  Private
const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Revoke all refresh tokens
    await RefreshToken.revokeAllUserTokens(userId, clientIp);

    // Clear access token cookie
    clearTokenCookie(res);

    logger.info(`User logged out from all devices: ${req.user.email} from IP: ${clientIp}`);

    return ApiResponse.success(res, null, 'Logged out from all devices successfully');

  } catch (error) {
    logger.error('Logout all error:', error);
    return next(ApiError.internal('Logout from all devices failed'));
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getCurrentUser,
  changePassword,
  logoutAll
};