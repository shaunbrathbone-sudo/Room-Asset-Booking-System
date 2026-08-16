import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as userService from '../services/user.service';

const router = Router();

const preferencesSchema = z.object({
    homeOfficeId: z.string().uuid().nullable().optional(),
    homeFloorId: z.string().uuid().nullable().optional(),
    preferredZoneId: z.string().uuid().nullable().optional(),
    defaultView: z.enum(['globe', 'office', 'floor']).optional(),
});

/**
 * GET /api/users/preferences
 */
router.get('/preferences', authenticate, async (req: Request, res: Response) => {
    try {
        const prefs = await userService.getPreferences(req.user!.id);
        if (!prefs) {
            res.status(404).json({ error: 'Preferences not found' });
            return;
        }
        res.json(prefs);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * PUT /api/users/preferences
 */
router.put('/preferences', authenticate, validateBody(preferencesSchema), async (req: Request, res: Response) => {
    try {
        await userService.updatePreferences(req.user!.id, req.body);
        const updated = await userService.getPreferences(req.user!.id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;