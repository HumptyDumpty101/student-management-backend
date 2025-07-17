const express = require('express');
const router = express.Router();

// Route modules import
const authRoutes = require('./authRoute');
const studentRoutes = require('./studentRoute');
const staffRoutes = require('./staffRoute');
const { version } = require('mongoose');

// Mount route modules
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/staff', staffRoutes);

module.exports = router;