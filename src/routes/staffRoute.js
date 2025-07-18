const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware } = require('../middleware/authMiddleware');
const { superAdminOnly } = require('../middleware/rbacMiddleware');
const { validateBody, validateParams, validateQuery } = require('../middleware/validationMiddleware');

// Import validation schemas
const { staffSchema, staffUpdateSchema, permissionSchema, idParamSchema, paginationSchema } = require('../utils/validators');

// Import controllers
const staffController = require('../controllers/staffController');

// Apply authentication and super admin requirement to all staff routes
router.use(authMiddleware);
router.use(superAdminOnly);

// @route   GET /api/v1/staff
// @desc    Get all staff members
// @access  Private (Super Admin only)
router.get('/', 
  validateQuery(paginationSchema),
  staffController.getStaff
);

// @route   POST /api/v1/staff
// @desc    Create new staff member
// @access  Private (Super Admin only)
router.post('/', 
  validateBody(staffSchema),
  staffController.createStaff
);

// @route   GET /api/v1/staff/:id
// @desc    Get single staff member by ID
// @access  Private (Super Admin only)
router.get('/:id', 
  validateParams(idParamSchema),
  staffController.getStaffMember
);

// @route   PUT /api/v1/staff/:id
// @desc    Update staff member
// @access  Private (Super Admin only)
router.put('/:id', 
  validateParams(idParamSchema),
  validateBody(staffUpdateSchema),
  staffController.updateStaff
);

// @route   DELETE /api/v1/staff/:id
// @desc    Delete staff member
// @access  Private (Super Admin only)
router.delete('/:id', 
  validateParams(idParamSchema),
  staffController.deleteStaff
);

// @route   PUT /api/v1/staff/:id/permissions
// @desc    Update staff member permissions
// @access  Private (Super Admin only)
router.put('/:id/permissions', 
  validateParams(idParamSchema),
  validateBody(permissionSchema),
  staffController.updatePermissions
);

// @route   POST /api/v1/staff/:id/activate
// @desc    Activate staff member
// @access  Private (Super Admin only)
router.post('/:id/activate', 
  validateParams(idParamSchema),
  staffController.activateStaff
);

// @route   POST /api/v1/staff/:id/deactivate
// @desc    Deactivate staff member
// @access  Private (Super Admin only)
router.post('/:id/deactivate', 
  validateParams(idParamSchema),
  staffController.deactivateStaff
);

module.exports = router;