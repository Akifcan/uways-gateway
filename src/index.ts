import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createServer } from 'http';
import config from './config/config.service';
import logger, { morganStream } from './config/logger';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import locationRoutes, { locationProxy } from './routes/location.routes';
import messagesRoutes from './routes/messages.routes';
import healthRoutes from './routes/health.routes';

const app = express();

app.use(helmet());

const morganFormat = config.isDevelopment ? 'dev' : 'combined';
app.use(morgan(morganFormat, { stream: morganStream }));

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }),
);

const defaultLimiter = rateLimit({
  windowMs: config.rateLimit.default.windowMs,
  max: config.rateLimit.default.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const healthLimiter = rateLimit({
  windowMs: config.rateLimit.health.windowMs,
  max: config.rateLimit.health.max,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/health', healthLimiter, healthRoutes);
app.use('/auth', healthLimiter, express.json({ limit: '10kb' }), authRoutes);
app.use('/location', defaultLimiter, locationRoutes);
app.use('/messages', defaultLimiter, messagesRoutes);

app.use(errorHandler);

const server = createServer(app);

// WebSocket upgrade proxying for location service
server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/location')) {
    logger.debug('WebSocket upgrade proxying to location service');
    locationProxy.upgrade(req, socket as any, head);
  }
});

server.listen(config.port, () => {
  logger.info(`🚀 Gateway running on http://localhost:${config.port}`);
  logger.info(`📍 Health check: http://localhost:${config.port}/health`);
  logger.info(`🗺️  Location → ${config.services.location}`);
  logger.info(`💬 Messages → ${config.services.message}`);
  logger.info(`📊 Environment: ${config.nodeEnv}`);
});

export default app;
