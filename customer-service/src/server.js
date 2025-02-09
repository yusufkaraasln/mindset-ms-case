import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import customerRoutes from './routes/customerRoutes.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(customerRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB connected successfully'))
  .catch((err) => logger.error('MongoDB connection error:', err));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  logger.info(`Customer Service is running on port ${PORT}`);
}); 