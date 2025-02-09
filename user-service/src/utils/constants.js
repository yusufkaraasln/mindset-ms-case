export const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || 'secretkey',
    EXPIRES_IN: '1h',
    ALGORITHMS: ['HS256']
  };
  
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500
  };
  
  export const USER_ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    SALES_REP: 'SALES_REP'
  };
  
  export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden access',
    INTERNAL_SERVER: 'Internal server error',
    VALIDATION_ERROR: 'Validation error'
  };
  
  export const SUCCESS_MESSAGES = {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    LOGIN_SUCCESS: 'Login successful'
  };