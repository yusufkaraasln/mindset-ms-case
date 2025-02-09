import { configureSecurity } from './security.js';
import { configureRateLimiter } from './rateLimiter.js';
import { configureJWT, jwtErrorHandler } from './auth.js';
import { errorHandler } from './errorHandler.js';


export const configureMiddlewares = (app) => {
  configureSecurity(app);
  configureRateLimiter(app);
  
  // JWT middleware ve error handler'ı doğru sırayla uygula
  app.use(configureJWT());
  app.use(jwtErrorHandler); // JWT hata yakalayıcısını genel error handler'dan önce ekle
};

export { errorHandler }; 