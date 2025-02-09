import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/userModel.js';
import { logger } from './logger.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected for seeding');

    // Check if existing admin user
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      logger.info('Admin user already exists');
      await mongoose.connection.close();
      return;
    }

    // Create new admin user
    const adminUser = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      roles: ['ADMIN']
    });

    logger.info(`Admin user created with email: ${adminUser.email}`);
    await mongoose.connection.close();
    
  } catch (error) {
    logger.error('Seeding error:', error);
    process.exit(1);
  }
};

// Start seeding
seedAdmin(); 