import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import saleRoutes from './routes/saleRoutes.js';
import { logger } from './utils/logger.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((error) => logger.error("Error connecting to MongoDB:", error));

app.use(saleRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(HTTP_STATUS.INTERNAL_SERVER).json({ status: "error", message: "Something broke!" });
});

app.listen(PORT, () => {
  logger.info(`Sales Service is running on port ${PORT}`);
});