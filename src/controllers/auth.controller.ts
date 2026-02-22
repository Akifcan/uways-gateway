import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

// POST /auth/token
export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'userId is required',
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign({ userId, service: 'gateway' }, jwtSecret, { expiresIn: '1h' });

    logger.info('Gateway token generated', { userId, ip: req.ip });

    res.json({ token, expiresIn: '1h' });
  } catch (error) {
    next(error);
  }
};
