import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/index.js';


export const configureSecurity = (app) => {
  app.use(helmet());
  app.use(cors(config.cors));
  app.disable('x-powered-by');
};