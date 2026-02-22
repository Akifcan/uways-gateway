import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
        [key: string]: any;
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn('Missing Authorization header', { ip: req.ip, path: req.path });
    return res.status(401).json({
      error: 'Authentication required',
      message: 'No authorization header provided',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Malformed Authorization header', { ip: req.ip, path: req.path });
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Invalid authorization format',
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    logger.error('JWT_SECRET not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;

    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      userId: decoded.userId || decoded.id || decoded.sub,
      ...decoded,
    };

    logger.debug('JWT authenticated', { userId: req.user!.id, path: req.path });

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token', { ip: req.ip, path: req.path });
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { ip: req.ip, path: req.path, error: (error as Error).message });
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication failed',
      });
    }

    logger.error('JWT verification error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ error: 'Authentication error' });
  }
};
