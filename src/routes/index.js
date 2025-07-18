const express = require('express');
const router = express.Router();

// Import individual route modules
const authRoutes = require('./authRoute');
const studentRoutes = require('./studentRoute');
const staffRoutes = require('./staffRoute');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/staff', staffRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      students: '/api/v1/students',
      staff: '/api/v1/staff'
    }
  });
});

module.exports = router;