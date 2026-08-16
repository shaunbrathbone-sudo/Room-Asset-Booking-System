import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as authService from '../services/auth.service';

const router = Router();

const registerSchema = z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    tenantId: z.string().uuid().optional(),
});

const loginSchema = z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token required'),
});

/**
 * POST /api/auth/register
 */
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (err) {
        const message = (err as Error).message;
        res.status(message.includes('already exists') ? 409 : 500).json({ error: message });
    }
});

/**
 * POST /api/auth/login
 */
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: (err as Error).message });
    }
});

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', validateBody(refreshSchema), async (req: Request, res: Response) => {
    try {
        const tokens = await authService.refreshToken(req.body.refreshToken);
        res.json(tokens);
    } catch (err) {
        res.status(401).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
    try {
        const user = await authService.getUserById(req.user!.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;