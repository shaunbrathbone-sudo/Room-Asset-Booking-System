import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import * as assetService from '../services/asset.service';

const router = Router();

/**
 * GET /api/assets — Catalog of shared corporate assets
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
    try {
        const category = req.query.category as string | undefined;
        const officeId = req.query.officeId as string | undefined;
        const assets = await assetService.getAssets(category, officeId);
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/assets/:id — Single asset detail
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const asset = await assetService.getAssetById(id);
        if (!asset) {
            res.status(404).json({ error: 'Asset not found' });
            return;
        }
        res.json(asset);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;