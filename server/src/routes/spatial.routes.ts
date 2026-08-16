import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import * as spatialService from '../services/spatial.service';

const router = Router();

router.get('/countries', optionalAuth, async (_req: Request, res: Response) => {
    try {
        const countries = await spatialService.getCountries();
        res.json(countries);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/countries/:slug/offices', optionalAuth, async (req: Request, res: Response) => {
    try {
        const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
        const offices = await spatialService.getOfficesByCountry(slug);
        res.json(offices);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/offices/:slug', optionalAuth, async (req: Request, res: Response) => {
    try {
        const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
        const office = await spatialService.getOfficeBySlug(slug);
        if (!office) {
            res.status(404).json({ error: 'Office not found' });
            return;
        }
        res.json(office);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/offices/:slug/floors', optionalAuth, async (req: Request, res: Response) => {
    try {
        const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
        const floors = await spatialService.getFloorsByOffice(slug);
        res.json(floors);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/floors/:id', optionalAuth, async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const floor = await spatialService.getFloorPlan(id);
        if (!floor) {
            res.status(404).json({ error: 'Floor not found' });
            return;
        }
        res.json(floor);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;