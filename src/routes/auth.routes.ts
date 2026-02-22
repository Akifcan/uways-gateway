import { Router } from 'express';
import { generateToken } from '../controllers/auth.controller';
import { validateMobileUserAgent } from '../middleware/user-agent.middleware';

const router = Router();

router.post('/token', validateMobileUserAgent, generateToken);

export default router;
