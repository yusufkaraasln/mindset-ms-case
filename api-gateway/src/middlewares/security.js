import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/index.js';

/**
 * Security middleware configuration
 * @param {import('express').Application} app
 */
export const configureSecurity = (app) => {
  app.use(helmet());
  app.use(cors(config.cors));
  app.disable('x-powered-by');
};