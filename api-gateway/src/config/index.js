import dotenv from 'dotenv';
import { services } from './services.js';

dotenv.config();

/**
 * @type {Object}
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  services,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
};