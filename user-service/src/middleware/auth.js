import jwt from 'jsonwebtoken';
import { JWT_CONFIG, ERROR_MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      logger.info('Auth middleware triggered');
      logger.info('Headers:', req.headers);
      
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        logger.error('No token provided');
        return res.status(401).json({
          status: 'error',
          message: ERROR_MESSAGES.UNAUTHORIZED
        });
      }

      logger.info('Token received:', token);
      
      const decoded = jwt.verify(token, JWT_CONFIG.SECRET);
      logger.info('Decoded token:', decoded);
      
      req.user = decoded;

      if (roles.length && !roles.some(role => req.user.roles.includes(role))) {
        logger.error(`Role mismatch. Required: ${roles}, User has: ${req.user.roles}`);
        return res.status(403).json({
          status: 'error',
          message: ERROR_MESSAGES.FORBIDDEN
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(401).json({
        status: 'error',
        message: ERROR_MESSAGES.UNAUTHORIZED,
        details: error.message
      });
    }
  };
}; 