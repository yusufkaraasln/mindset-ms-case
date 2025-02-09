import express from 'express';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { configureMiddlewares, errorHandler } from './middlewares/index.js';
import { configureRoutes } from './routes/index.js';
import crypto from 'crypto';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  try {
    const app = express();

    // Request ID middleware
    app.use((req, res, next) => {
      req.id = crypto.randomUUID();
      next();
    });

    // Serve Swagger docs before any auth middleware is applied
    const swaggerFilePath = path.resolve(__dirname, 'docs/swagger.yaml');
    const swaggerDocument = YAML.load(swaggerFilePath);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Configure middlewares
    configureMiddlewares(app);

    // Configure routes
    configureRoutes(app);

    // Error handler
    app.use(errorHandler);

    app.listen(config.port, () => {
      logger.info(`API Gateway is running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();