const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');

// Import validation schemas
const { 
  loginSchema, 
  refreshTokenSchema, 
  changePasswordSchema 
} = require('../utils/validators');

// Import controllers
const authController = require('../controllers/authController');

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', 
  validateBody(loginSchema),
  authController.login
);

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', 
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', 
  authController.logout
);

// @route   GET /api/v1/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', 
  authMiddleware,
  authController.getCurrentUser
);

// @route   POST /api/v1/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', 
  authMiddleware,
  validateBody(changePasswordSchema),
  authController.changePassword
);

// @route   POST /api/v1/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', 
  authMiddleware,
  authController.logoutAll
);

module.exports = router;