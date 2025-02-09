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

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'secretkey'
};

export const SUCCESS_MESSAGES = {
  CUSTOMER_CREATED: 'Customer created successfully',
  CUSTOMER_UPDATED: 'Customer updated successfully',
  CUSTOMER_DELETED: 'Customer deleted successfully'
};

export const ERROR_MESSAGES = {
  CUSTOMER_NOT_FOUND: 'Customer not found',
  INTERNAL_SERVER: 'Internal server error',
  VALIDATION_ERROR: 'Validation error'
}; 