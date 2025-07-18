const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { logger } = require('../utils/logger');

// @desc    Get all staff members
// @route   GET /api/v1/staff
// @access  Private (Super Admin only)
const getStaff = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, department, isActive } = req.query;
    
    const query = { role: 'staff' };
    
    if (search) {
      query.$or = [
        { 'name.firstName': { $regex: search, $options: 'i' } },
        { 'name.lastname': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (page - 1) * limit;
    const staff = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .select('-password');

    const total = await User.countDocuments(query);

    return ApiResponse.success(res, {
      staff,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStaff: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }, 'Staff retrieved successfully');

  } catch (error) {
    logger.error('Get staff error:', error);
    return next(ApiError.internal('Failed to retrieve staff'));
  }
};

// @desc    Create new staff member
// @route   POST /api/v1/staff
// @access  Private (Super Admin only)
const createStaff = async (req, res, next) => {
  try {
    const staffData = {
      ...req.body,
      role: 'staff',
      createdBy: req.user.id
    };

    const staff = new User(staffData);
    await staff.save();
    
    const populatedStaff = await User.findById(staff._id)
      .populate('createdBy', 'name email')
      .select('-password');

    logger.info(`Staff created: ${staff.employeeId} by user: ${req.user.email}`);

    return ApiResponse.created(res, { staff: populatedStaff }, 'Staff member created successfully');

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(ApiError.conflict(`${field} already exists`));
    }
    
    logger.error('Create staff error:', error);
    return next(ApiError.internal('Failed to create staff member'));
  }
};

// @desc    Get single staff member by ID
// @route   GET /api/v1/staff/:id
// @access  Private (Super Admin only)
const getStaffMember = async (req, res, next) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' })
      .populate('createdBy', 'name email')
      .select('-password');

    if (!staff) {
      return next(ApiError.notFound('Staff member not found'));
    }

    return ApiResponse.success(res, { staff }, 'Staff member retrieved successfully');

  } catch (error) {
    logger.error('Get staff member error:', error);
    return next(ApiError.internal('Failed to retrieve staff member'));
  }
};

// @desc    Update staff member
// @route   PUT /api/v1/staff/:id
// @access  Private (Super Admin only)
const updateStaff = async (req, res, next) => {
  try {
    // Remove password and role from update data for security
    const { password, role, ...updateData } = req.body;

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .select('-password');

    if (!staff) {
      return next(ApiError.notFound('Staff member not found'));
    }

    logger.info(`Staff updated: ${staff.employeeId} by user: ${req.user.email}`);

    return ApiResponse.success(res, { staff }, 'Staff member updated successfully');

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(ApiError.conflict(`${field} already exists`));
    }
    
    logger.error('Update staff error:', error);
    return next(ApiError.internal('Failed to update staff member'));
  }
};

// @desc    Delete staff member (soft delete)
// @route   DELETE /api/v1/staff/:id
// @access  Private (Super Admin only)
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { isActive: false },
      { new: true }
    );

    if (!staff) {
      return next(ApiError.notFound('Staff member not found'));
    }

    logger.info(`Staff deleted: ${staff.employeeId} by user: ${req.user.email}`);

    return ApiResponse.success(res, null, 'Staff member deleted successfully');

  } catch (error) {
    logger.error('Delete staff error:', error);
    return next(ApiError.internal('Failed to delete staff member'));
  }
};

// @desc    Update staff member permissions
// @route   PUT /api/v1/staff/:id/permissions
// @access  Private (Super Admin only)
const updatePermissions = async (req, res, next) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { permissions: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!staff) {
      return next(ApiError.notFound('Staff member not found'));
    }

    logger.info(`Staff permissions updated: ${staff.employeeId} by user: ${req.user.email}`);

    return ApiResponse.success(res, { 
      permissions: staff.permissions 
    }, 'Permissions updated successfully');

  } catch (error) {
    logger.error('Update permissions error:', error);
    return next(ApiError.internal('Failed to update permissions'));
  }
};

// @desc    Activate staff member
// @route   POST /api/v1/staff/:id/activate
// @access  Private (Super Admin only)
const activateStaff = async (req, res, next) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!staff) {
      return next(ApiError.notFound('Staff member not found'));
    }

    logger.info(`Staff activated: ${staff.employeeId} by user: ${req.user.email}`);

    return ApiResponse.success(res, { staff }, 'Staff member activated successfully');

  } catch (error) {
    logger.error('Activate staff error:', error);
    return next(ApiError.internal('Failed to activate staff member'));
  }
};

// @desc    Deactivate staff member
// @route   POST /api/v1/staff/:id/deactivate
// @access  Private (Super Admin only)
const deactivateStaff = async (req, res, next) => {
  try {
    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'staff' },
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!staff) {
      return next(ApiError.notFound('Staff member not found'));
    }

    logger.info(`Staff deactivated: ${staff.employeeId} by user: ${req.user.email}`);

    return ApiResponse.success(res, { staff }, 'Staff member deactivated successfully');

  } catch (error) {
    logger.error('Deactivate staff error:', error);
    return next(ApiError.internal('Failed to deactivate staff member'));
  }
};

module.exports = {
  getStaff,
  createStaff,
  getStaffMember,
  updateStaff,
  deleteStaff,
  updatePermissions,
  activateStaff,
  deactivateStaff
};