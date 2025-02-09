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

export const ERROR_MESSAGES = {
  RATE_LIMIT: 'Too many requests from this IP, please try again later.',
  INTERNAL_SERVER: 'Internal Server Error'
}; 

export const AUTH_MESSAGES = {
  INVALID_TOKEN: 'Invalid token',
  NO_TOKEN: 'No token provided',
  TOKEN_EXPIRED: 'Token has expired'
};

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'secretkey',
  EXPIRES_IN: '1h',
  ALGORITHMS: ['HS256']
}; 