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


// ─── MY ALLOCATED PERMANENT DESK & DAYS ──────────────────────────────────────

router.get('/my-allocated-desk', authenticate, async (req: Request, res: Response) => {
    try {
        const pool = await (await import('../config/database')).getPool();
        const userId = req.user!.id;

        const result = await pool.request()
            .input('userId', userId)
            .query(`
                SELECT 
                    d.id, d.code, d.label, d.desk_type, d.assigned_user_id, 
                    d.assigned_user_name, d.assigned_days, d.equipment_tags,
                    z.name as zone_name,
                    f.id as floor_id, f.name as floor_name, f.slug as floor_slug, f.floor_number,
                    o.id as office_id, o.name as office_name, o.slug as office_slug,
                    c.slug as country_slug
                FROM desks d
                JOIN zones z ON d.zone_id = z.id
                JOIN floors f ON z.floor_id = f.id
                JOIN offices o ON f.office_id = o.id
                JOIN countries c ON o.country_id = c.id
                WHERE d.desk_type = 'permanent' AND d.assigned_user_id = @userId
                LIMIT 1
            `);

        if (!result.recordset?.length) {
            res.json({ hasAllocatedDesk: false, desk: null });
            return;
        }

        const desk = result.recordset[0];
        let days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        if (desk.assigned_days) {
            try { days = JSON.parse(desk.assigned_days); } catch {}
        }

        res.json({
            hasAllocatedDesk: true,
            desk: {
                ...desk,
                assignedDays: days,
            },
        });
    } catch (err) {
        console.error('Error fetching allocated desk:', err);
        res.status(500).json({ error: 'Failed to fetch allocated desk' });
    }
});

router.put('/my-allocated-desk/days', authenticate, async (req: Request, res: Response) => {
    try {
        const pool = await (await import('../config/database')).getPool();
        const userId = req.user!.id;
        const { assignedDays } = req.body;

        if (!Array.isArray(assignedDays)) {
            res.status(400).json({ error: 'assignedDays must be an array of days' });
            return;
        }

        await pool.request()
            .input('userId', userId)
            .input('assignedDays', JSON.stringify(assignedDays))
            .query(`
                UPDATE desks
                SET assigned_days = @assignedDays
                WHERE desk_type = 'permanent' AND assigned_user_id = @userId
            `);

        res.json({ message: 'In-office desk schedule updated successfully', assignedDays });
    } catch (err) {
        console.error('Error updating allocated desk days:', err);
        res.status(500).json({ error: 'Failed to update desk schedule' });
    }
});

export default router;