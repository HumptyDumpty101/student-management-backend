const express = require('express');
const router = express.Router();

// Route modules import
const authRoutes = require('./auth');
const studentRoutes = require('./students');
const staffRoutes = require('./staff');
const { version } = require('mongoose');

// Mount route modules
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/staff', staffRoutes);

module.exports = router;