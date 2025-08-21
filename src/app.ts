import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { configurePassport } from './config/passport';
import { authService } from './container';
import { healthCheck } from './utils/health';
import logger from './utils/logger';

const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Request logging (before other middleware)
  app.use(requestLogger);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Passport
  app.use(passport.initialize());
  configurePassport(authService);

  // Routes
  app.get('/health', healthCheck);
  app.use('/api', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  logger.info('Application initialized successfully');

  return app;
};

export default createApp;
