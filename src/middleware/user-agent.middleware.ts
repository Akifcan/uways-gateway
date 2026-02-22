import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const validateMobileUserAgent = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'];

  if (!userAgent && process.env.NODE_ENV === 'development') {
    logger.warn('Request without User-Agent (allowed in development)', { path: req.path, ip: req.ip });
    return next();
  }

  if (!userAgent || !userAgent.includes('UwaysApp/')) {
    logger.warn('Invalid User-Agent - non-mobile access attempt', {
      userAgent,
      path: req.path,
      ip: req.ip,
    });
    return res.status(403).json({
      error: 'Access denied',
      message: 'INTERNAL SERVER ERROR',
    });
  }

  next();
};
