import { expressjwt } from 'express-jwt';
import { JWT_CONFIG, AUTH_MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * JWT error handler middleware
 */
export const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    logger.error('JWT Error:', { 
      error: err.message,
      token: req.headers.authorization
    });
    return res.status(401).json({
      message: 'Authentication required',
      details: err.message,
      requestId: req.id,
    });
  }
  next(err);
};

/**
 * JWT authentication middleware configuration
 */
export const configureJWT = () => {
  logger.info('JWT Config:', { secret: JWT_CONFIG.SECRET });
  
  return expressjwt({
    secret: JWT_CONFIG.SECRET,
    algorithms: ['HS256']
  }).unless({
    path: [
      '/api/auth/login',
      '/api/health-check',
      { url: /^\/api\/public\/.*/, methods: ['GET'] }
    ]
  });
};

/**
 * Role-based authorization middleware
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.auth || !req.auth.roles) {
      logger.error('Authorization failed: No roles found');
      return res.status(403).json({ 
        error: 'Forbidden',
        requestId: req.id 
      });
    }

    const hasRole = roles.some(role => req.auth.roles.includes(role));
    if (!hasRole) {
      logger.error(`Authorization failed: Required roles [${roles}], User roles [${req.auth.roles}]`);
      return res.status(403).json({ 
        error: 'Forbidden',
        requestId: req.id 
      });
    }

    next();
  };
};
