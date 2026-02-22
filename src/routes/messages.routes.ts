import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateMobileUserAgent } from '../middleware/user-agent.middleware';
import config from '../config/config.service';
import logger from '../config/logger';

const router = Router();

const messagesProxy = createProxyMiddleware({
  target: config.services.message,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req: any) => {
      proxyReq.setHeader('X-Gateway-Secret', config.gatewaySecret);
      if (req.user?.userId) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
      }
    },
    error: (err, req: any, res: any) => {
      logger.error('Message service proxy error', {
        error: err.message,
        path: req.path,
      });
      if (!res.headersSent) {
        res.status(502).json({ error: 'Message service unavailable' });
      }
    },
  },
});

router.use('/', validateMobileUserAgent, authenticateJWT, messagesProxy);

export default router;
