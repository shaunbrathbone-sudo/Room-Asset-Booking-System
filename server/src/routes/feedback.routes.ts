import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import * as feedbackService from '../services/feedback.service';

const router = Router();

const createFeatureSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    problemStatement: z.string().min(15, 'Problem statement must be at least 15 characters'),
    businessImpact: z.string().min(15, 'Business impact must be at least 15 characters'),
    category: z.string().optional(),
});

const moderateFeatureSchema = z.object({
    status: z.enum(['approved', 'rejected', 'planned', 'in_development', 'completed']),
    notes: z.string().optional(),
});

/**
 * POST /api/feedback/features — Submit employee feature request
 */
router.post('/features', authenticate, validateBody(createFeatureSchema), async (req: Request, res: Response) => {
    try {
        const id = await feedbackService.submitFeatureRequest({
            userId: req.user!.id,
            ...req.body,
        });
        res.status(201).json({ id, message: 'Feature request submitted for moderation.' });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/feedback/features — Public published features
 */
router.get('/features', optionalAuth, async (req: Request, res: Response) => {
    try {
        const features = await feedbackService.getPublicFeatures(req.user?.id);
        res.json(features);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/feedback/features/pending — Admin moderation queue
 */
router.get('/features/pending', authenticate, requireRole('super_admin'), async (_req: Request, res: Response) => {
    try {
        const features = await feedbackService.getPendingFeatures();
        res.json(features);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * POST /api/feedback/features/:id/upvote — Toggle upvote
 */
router.post('/features/:id/upvote', authenticate, async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await feedbackService.toggleUpvote(id, req.user!.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * PUT /api/feedback/features/:id/moderate — Super admin moderation gate
 */
router.put('/features/:id/moderate', authenticate, requireRole('super_admin'), validateBody(moderateFeatureSchema), async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await feedbackService.moderateFeature(id, req.body.status, req.body.notes);
        res.json({ message: `Feature status updated to ${req.body.status}` });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;