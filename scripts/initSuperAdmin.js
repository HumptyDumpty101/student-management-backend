require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const { logger } = require('../src/utils/logger');
const connectDB = require('../src/config/dbConfig');

// Initialize connection to MongoDB
connectDB();

const createSuperAdmin = async () => {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superAdmin' });
    
    if (existingSuperAdmin) {
      logger.info('Super admin already exists');
      return;
    }

    // Create super admin
    const superAdminData = {
      name: {
        firstName: 'Super',
        lastName: 'Admin'
      },
      email: 'admin@schoolmanagement.com',
      password: 'admin123456',
      phone: '9744992464',
      role: 'superAdmin',
      permissions: {
        students: {
          create: true,
          read: true,
          update: true,
          delete: true
        },
        staff: {
          create: true,
          read: true,
          update: true,
          delete: true
        }
      },
      isActive: true
    };

    const superAdmin = await User.createSuperAdmin(superAdminData);
    
    logger.info('Super admin created successfully');
    logger.info(`Email: ${superAdmin.email}`);
    logger.info(`Password: admin123456`);
    logger.info(`Role: ${superAdmin.role}`);
    
  } catch (error) {
    logger.error('Error creating super admin:', error);
  }
};

const seedDatabase = async () => {
  await connectDB();
  await createSuperAdmin();
  mongoose.connection.close();
  logger.info('Database seeding completed');
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, createSuperAdmin };