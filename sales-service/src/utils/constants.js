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
    SALE_CREATED: "Sale created successfully",
    SALE_UPDATED: "Sale updated successfully",
    SALE_DELETED: "Sale deleted successfully"
  };
  
  export const ERROR_MESSAGES = {
    NOT_FOUND: "Resource not found",
    INTERNAL_SERVER: "Internal server error"
  };