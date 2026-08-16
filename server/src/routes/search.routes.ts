import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middleware/validate';
import { optionalAuth } from '../middleware/auth';
import * as searchService from '../services/search.service';

const router = Router();

const searchQuerySchema = z.object({
    q: z.string().min(1, 'Search query required'),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 20)),
});

/**
 * GET /api/search?q=&limit=
 */
router.get('/', optionalAuth, validateQuery(searchQuerySchema), async (req: Request, res: Response) => {
    try {
        const { q, limit } = req.query as unknown as { q: string; limit: number };
        const results = await searchService.universalSearch(q, limit);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;