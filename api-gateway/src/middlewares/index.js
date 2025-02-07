import { configureSecurity } from './security.js';
import { configureRateLimiter } from './rateLimiter.js';
import { errorHandler } from './errorHandler.js';

/**
 * Configure all middlewares
 * @param {import('express').Application} app
 */
export const configureMiddlewares = (app) => {
  configureSecurity(app);
  configureRateLimiter(app);
};

export { errorHandler }; 