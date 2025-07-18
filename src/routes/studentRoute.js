const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validateBody, validateQuery, validateParams } = require('../middleware/validationMiddleware');
const upload = require('../config/multer');

// Import validation schemas
const { studentSchema, studentUpdateSchema, paginationSchema, idParamSchema } = require('../utils/validators');

// Import controllers
const studentController = require('../controllers/studentController');

// Apply authentication to all student routes
router.use(authMiddleware);

// @route   GET /api/v1/students
// @desc    Get all students with pagination and search
// @access  Private (requires students.read permission)
router.get('/', 
  requirePermission('students', 'read'),
  validateQuery(paginationSchema),
  studentController.getStudents
);

// @route   POST /api/v1/students
// @desc    Create new student
// @access  Private (requires students.create permission)
router.post('/', 
  requirePermission('students', 'create'),
  validateBody(studentSchema),
  studentController.createStudent
);

// @route   GET /api/v1/students/:id
// @desc    Get single student by ID
// @access  Private (requires students.read permission)
router.get('/:id', 
  requirePermission('students', 'read'),
  validateParams(idParamSchema),
  studentController.getStudent
);

// @route   PUT /api/v1/students/:id
// @desc    Update student
// @access  Private (requires students.update permission)
router.put('/:id', 
  requirePermission('students', 'update'),
  validateParams(idParamSchema),
  validateBody(studentUpdateSchema),
  studentController.updateStudent
);

// @route   DELETE /api/v1/students/:id
// @desc    Delete student
// @access  Private (requires students.delete permission)
router.delete('/:id', 
  requirePermission('students', 'delete'),
  validateParams(idParamSchema),
  studentController.deleteStudent
);

// @route   POST /api/v1/students/:id/photo
// @desc    Upload student photo
// @access  Private (requires students.update permission)
router.post('/:id/photo', 
  requirePermission('students', 'update'),
  validateParams(idParamSchema),
  upload.single('photo'),
  studentController.uploadPhoto
);

// @route   DELETE /api/v1/students/:id/photo
// @desc    Delete student photo
// @access  Private (requires students.update permission)
router.delete('/:id/photo', 
  requirePermission('students', 'update'),
  validateParams(idParamSchema),
  studentController.deletePhoto
);

// @route   GET /api/v1/students/:id/photo
// @desc    Get student photo
// @access  Public (photos are public)
router.get('/:id/photo', 
  validateParams(idParamSchema),
  studentController.getPhoto
);

module.exports = router;