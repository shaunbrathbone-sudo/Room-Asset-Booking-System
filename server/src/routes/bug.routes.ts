import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as bugService from '../services/bug.service';

const router = Router();

const createBugSchema = z.object({
    officeId: z.string().uuid().optional(),
    title: z.string().min(5, 'Title required'),
    description: z.string().min(10, 'Description required'),
    routePath: z.string().optional(),
    objectId: z.string().optional(),
    threeCoords: z.string().optional(),
    browserInfo: z.string().optional(),
    osInfo: z.string().optional(),
    viewportSize: z.string().optional(),
    consoleLogs: z.string().optional(),
});

/**
 * GET /api/bugs/check-duplicates?q= — NLP live duplicate check
 */
router.get('/check-duplicates', optionalAuth, async (req: Request, res: Response) => {
    try {
        const q = req.query.q as string;
        const officeId = req.query.officeId as string | undefined;
        if (!q || q.length < 3) {
            res.json([]);
            return;
        }
        const matches = await bugService.findDuplicateBugs(q, officeId);
        res.json(matches);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * POST /api/bugs — Submit bug with telemetry
 */
router.post('/', authenticate, validateBody(createBugSchema), async (req: Request, res: Response) => {
    try {
        const id = await bugService.createBugTicket({
            userId: req.user!.id,
            ...req.body,
        });
        res.status(201).json({ id, message: 'Bug report logged successfully.' });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * POST /api/bugs/:id/me-too — Increment incident multiplier
 */
router.post('/:id/me-too', authenticate, async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await bugService.subscribeToBug(id, req.user!.id);
        res.json({ message: 'Subscribed to incident updates.', multiplier: result.multiplier });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/bugs — List bug tickets
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
    try {
        const status = req.query.status as string | undefined;
        const bugs = await bugService.getAllBugs(status);
        res.json(bugs);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;