import jwt from 'jsonwebtoken';
import { HTTP_STATUS, JWT_CONFIG } from '../utils/constants.js';

export const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // if there is no authenticated user objct authenticate with token
      if (!req.user) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: 'error',
            message: 'Authorization header missing'
          });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_CONFIG.SECRET);
        req.user = decoded;
      }
      
      // ifuser does not have any of the allowed roles deny access
      if (allowedRoles.length > 0) {
        if (!req.user.roles || !req.user.roles.some(role => allowedRoles.includes(role))) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            status: 'error',
            message: 'Access denied, insufficient permissions'
          });
        }
      }
      
      next();
    } catch (error) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }
  };
}; 