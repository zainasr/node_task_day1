import createApp from './app';
import { env } from './config/env';
import logger from './utils/logger';

const { PORT, NODE_ENV } = env;

const startServer = () => {
  try {
    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        environment: NODE_ENV,
        healthCheck: `http://localhost:${PORT}/health`,
        apiBaseUrl: `http://localhost:${PORT}/api`,
      });
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string): void => {
      logger.info('Shutdown signal received', { signal });

      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled Rejection', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
};

startServer();
