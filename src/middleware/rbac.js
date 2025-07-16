const ApiError = require('../utils/ApiError');

// Check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Convert single role to array for consistency
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient role privileges'));
    }

    next();
  };
};

// Check if user has specific permission
const requirePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // Super admin has all permissions
    if (req.user.role === 'superAdmin') {
      return next();
    }

    // Check staff permissions
    if (req.user.role === 'staff') {
      const hasPermission = req.user.permissions?.[module]?.[action];
      
      if (!hasPermission) {
        return next(ApiError.forbidden(`No permission for ${module}.${action}`));
      }
      
      return next();
    }

    return next(ApiError.forbidden('Access denied'));
  };
};

// Super admin only access
const superAdminOnly = requireRole('superAdmin');

// Staff or Super admin access
const staffOrAdmin = requireRole(['staff', 'supeAdmin']);

// Helper function to check permissions programmatically
const hasPermission = (user, module, action) => {
  if (!user) return false;
  if (user.role === 'superAdmin') return true;
  return user.permissions?.[module]?.[action] || false;
};

module.exports = {
  requireRole,
  requirePermission,
  superAdminOnly,
  staffOrAdmin,
  hasPermission
};