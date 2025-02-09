import proxy from 'express-http-proxy';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { JWT_CONFIG } from '../utils/constants.js';


export const configureRoutes = (app) => {
  config.services.forEach(({ path, target, auth = true }) => {
    app.use(`/api/${path}`, proxy(target, {
      proxyReqPathResolver: req => {
        logger.info(`Proxying request: /api/${path} -> ${target}${req.url}`);
        return req.url;
      },
      proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`);
        next(err);
      },
      // Send JWT token to microservices
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        if (auth && srcReq.auth) {
          proxyReqOpts.headers['x-user-id'] = srcReq.auth.id;
          proxyReqOpts.headers['x-user-roles'] = JSON.stringify(srcReq.auth.roles);
        }
        return proxyReqOpts;
      }
    }));
  });
};