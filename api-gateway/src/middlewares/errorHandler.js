import { logger } from '../utils/logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);

  res.status(HTTP_STATUS.INTERNAL_SERVER).json({ 
    error: ERROR_MESSAGES.INTERNAL_SERVER,
    requestId: req.id
  });
}; 