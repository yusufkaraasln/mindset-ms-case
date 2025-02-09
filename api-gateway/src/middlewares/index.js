import { configureSecurity } from './security.js';
import { configureRateLimiter } from './rateLimiter.js';
import { configureJWT, jwtErrorHandler } from './auth.js';
import { errorHandler } from './errorHandler.js';


export const configureMiddlewares = (app) => {
  configureSecurity(app);
  configureRateLimiter(app);
  
  // Apply JWT middleware and error handler
  app.use(configureJWT());
  app.use(jwtErrorHandler); // JWT error handler before global error handler
};

export { errorHandler }; 