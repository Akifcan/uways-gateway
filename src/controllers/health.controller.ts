import { Request, Response } from 'express';
import config from '../config/config.service';

export const healthCheck = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'uways-gateway',
    version: '1.0.0',
    downstream: {
      location: config.services.location,
      message: config.services.message,
    },
  });
};
