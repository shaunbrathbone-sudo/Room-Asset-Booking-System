import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { getPool } from '../config/database';
import { getBookingById } from '../services/booking.service';

const router = Router();

const approvalDecisionSchema = z.object({
    action: z.enum(['approve', 'reject']),
    note: z.string().max(1000).optional(),
});

/**
 * GET /api/admin/approvals — Queue of approval-gated bookings
 */
router.get('/approvals', authenticate, requireRole('approver', 'location_admin', 'super_admin'), async (_req: Request, res: Response) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT id FROM bookings
            WHERE status = 'pending_approval'
            ORDER BY created_at ASC
        `);

        const list = [];
        for (const row of result.recordset) {
            list.push(await getBookingById(row.id));
        }
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * POST /api/admin/approvals/:id/decision — Approve or reject booking
 */
router.post('/approvals/:id/decision', authenticate, requireRole('approver', 'location_admin', 'super_admin'), validateBody(approvalDecisionSchema), async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { action, note } = req.body;
        const pool = await getPool();

        if (action === 'reject' && (!note || note.trim().length === 0)) {
            res.status(400).json({ error: 'Mandatory justification note required when rejecting a reservation.' });
            return;
        }

        const newStatus = action === 'approve' ? 'confirmed' : 'cancelled';

        await pool.request()
            .input('id', id)
            .input('status', newStatus)
            .input('note', note || null)
            .query(`
                UPDATE bookings
                SET status = @status, approval_note = @note, updated_at = GETUTCDATE()
                WHERE id = @id
            `);

        res.json({ message: `Reservation successfully ${action}d.` });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;