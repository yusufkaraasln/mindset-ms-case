import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ERROR_MESSAGES } from '../utils/constants.js';


export const configureRateLimiter = (app) => {
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: { error: ERROR_MESSAGES.RATE_LIMIT },
      standardHeaders: true,
      legacyHeaders: false
    })
  );
};