import express from 'express';
import dotenv from 'dotenv';
import { createLogger, format, transports } from 'winston';

dotenv.config();

// Logger yapılandırması
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const port = process.env.PORT || 8081;

// Health check endpoint
app.get('/', (req, res) => {
  const healthCheck = {
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage()
  };
  
  res.json(healthCheck);
});

app.listen(port, () => {
  logger.info(`Health Check Service is running on port ${port}`);
}); 