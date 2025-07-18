const Student = require('../models/Student');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { logger } = require('../utils/logger');

// @desc    Get all students with pagination and search
// @route   GET /api/v1/students
// @access  Private (requires students.read permission)
const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, standard, section, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { 'name.firstName': { $regex: search, $options: 'i' } },
        { 'name.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (standard) query.standard = standard;
    if (section) query.section = section;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const students = await Student.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await Student.countDocuments(query);

    return ApiResponse.success(res, {
      students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }, 'Students retrieved successfully');

  } catch (error) {
    logger.error('Get students error:', error);
    return next(ApiError.internal('Failed to retrieve students'));
  }
};

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Private (requires students.create permission)
const createStudent = async (req, res, next) => {
  try {
    const studentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const student = new Student(studentData);
    await student.save();
    
    const populatedStudent = await Student.findById(student._id)
      .populate('createdBy', 'name email');

    logger.info(`Student created: ${student.studentId} by user: ${req.user.email}`);

    return ApiResponse.created(res, { student: populatedStudent }, 'Student created successfully');

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(ApiError.conflict(`${field} already exists`));
    }
    
    logger.error('Create student error:', error);
    return next(ApiError.internal('Failed to create student'));
  }
};

// @desc    Get single student by ID
// @route   GET /api/v1/students/:id
// @access  Private (requires students.read permission)
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!student) {
      return next(ApiError.notFound('Student not found'));
    }

    return ApiResponse.success(res, { student }, 'Student retrieved successfully');

  } catch (error) {
    logger.error('Get student error:', error);
    return next(ApiError.internal('Failed to retrieve student'));
  }
};

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Private (requires students.update permission)
const updateStudent = async (req, res, next) => {
  try {
    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');

    if (!student) {
      return next(ApiError.notFound('Student not found'));
    }

    logger.info(`Student updated: ${student.studentId} by user: ${req.user.email}`);

    return ApiResponse.success(res, { student }, 'Student updated successfully');

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(ApiError.conflict(`${field} already exists`));
    }
    
    logger.error('Update student error:', error);
    return next(ApiError.internal('Failed to update student'));
  }
};

// @desc    Delete student (soft delete)
// @route   DELETE /api/v1/students/:id
// @access  Private (requires students.delete permission)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!student) {
      return next(ApiError.notFound('Student not found'));
    }

    logger.info(`Student deleted: ${student.studentId} by user: ${req.user.email}`);

    return ApiResponse.success(res, null, 'Student deleted successfully');

  } catch (error) {
    logger.error('Delete student error:', error);
    return next(ApiError.internal('Failed to delete student'));
  }
};

// @desc    Upload student photo
// @route   POST /api/v1/students/:id/photo
// @access  Private (requires students.update permission)
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(ApiError.badRequest('No photo file uploaded'));
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return next(ApiError.notFound('Student not found'));
    }

    // Update photo info
    student.profilePhoto = {
      url: `/uploads/students/${req.file.filename}`,
      filename: req.file.filename,
      uploadedAt: new Date(),
      uploadedBy: req.user.id
    };
    
    await student.save();

    return ApiResponse.success(res, { 
      photoUrl: student.profilePhoto.url 
    }, 'Photo uploaded successfully');

  } catch (error) {
    logger.error('Upload photo error:', error);
    return next(ApiError.internal('Failed to upload photo'));
  }
};

// @desc    Delete student photo
// @route   DELETE /api/v1/students/:id/photo
// @access  Private (requires students.update permission)
const deletePhoto = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return next(ApiError.notFound('Student not found'));
    }

    await student.removePhoto();

    return ApiResponse.success(res, null, 'Photo deleted successfully');

  } catch (error) {
    logger.error('Delete photo error:', error);
    return next(ApiError.internal('Failed to delete photo'));
  }
};

// @desc    Get student photo
// @route   GET /api/v1/students/:id/photo
// @access  Public
const getPhoto = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).select('profilePhoto');
    
    if (!student || !student.profilePhoto.url) {
      return next(ApiError.notFound('Photo not found'));
    }

    return ApiResponse.success(res, { 
      photoUrl: student.profilePhoto.url 
    }, 'Photo retrieved successfully');

  } catch (error) {
    logger.error('Get photo error:', error);
    return next(ApiError.internal('Failed to retrieve photo'));
  }
};

module.exports = {
  getStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadPhoto,
  deletePhoto,
  getPhoto
};