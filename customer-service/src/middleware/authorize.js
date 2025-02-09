import jwt from 'jsonwebtoken';
import { HTTP_STATUS, JWT_CONFIG } from '../utils/constants.js';

export const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Authorization header is missing.'
        });
      }
      
      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Token not provided.'
        });
      }
      
      try {
        const decoded = jwt.verify(token, JWT_CONFIG.SECRET);
        req.user = decoded;
      } catch (err) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Invalid token: ' + err.message
        });
      }
    }
    
    // get user roles and check if they are authorized
    const userRoles = req.user?.roles;
    if (!userRoles) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'User roles not found. Unauthorized.'
      });
    }
    
    // user roles and allowed roles are compared
    const isAuthorized = allowedRoles.some(role => userRoles.includes(role));
    if (!isAuthorized) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Forbidden. Insufficient permissions.'
      });
    }
    
    next();
  };
}; 