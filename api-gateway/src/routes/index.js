import proxy from 'express-http-proxy';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

/**
 * Configure service routes
 * @param {import('express').Application} app
 */
export const configureRoutes = (app) => {
  config.services.forEach(({ path, target }) => {
    app.use(`/api/${path}`, proxy(target, {
      proxyReqPathResolver: req => {
        logger.info(`Proxying request: /api/${path} -> ${target}${req.url}`);
        return req.url;
      },
      proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy error: ${err.message}`);
        next(err);
      }
    }));
  });
};