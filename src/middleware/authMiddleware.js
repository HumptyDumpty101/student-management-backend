const {verifyAccessToken} = require('../config/jwtConfig');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const authMiddleware = async(req,res,next) => {
    try {
        const token = req.cookies.accessToken;

        if(!token) {
            return next(ApiError.unauthorized('Access token is missing'));
        }

        // Verify Token
        const decoded = await verifyAccessToken(token);

        // Get user from DB
        const user = await User.findById(decoded.id).select('-password -loginAttempts -lockUntil');
        
        if(!user) {
            return next(ApiError.unauthorized('User not found'));
        }

        if(!user.isActive) {
            return next(ApiError.forbidden('User account is inactive'));
        }

        if(user.isLocked) {
            return next(ApiError.forbidden('User account is locked'));
        }   

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            fullName: user.fullName,
            department: user.department,
        };

        next();
    
    } catch (error) {
        if(error.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Access token has expired'));
        }

        if(error.name === 'JsonWebTokenError') {
            return next(ApiError.unauthorized('Invalid access token'));
        }

        return next(ApiError.unauthorized('Authentication failed'));
    }
};


// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          fullName: user.fullName,
          department: user.department
        };
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
    authMiddleware,
    optionalAuth
}