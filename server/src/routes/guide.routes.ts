import { Router } from 'express';
import { getPool } from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

// GET /api/offices/:slug/guide
router.get('/offices/:slug/guide', async (req, res) => {
    try {
        const { slug } = req.params;
        const pool = await getPool();

        const result = await pool.request()
            .input('slug', slug)
            .query(`
                SELECT og.*, o.name AS office_name, o.slug AS office_slug
                FROM office_guides og
                JOIN offices o ON o.id = og.office_id
                WHERE o.slug = @slug
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Office guide not found' });
        }

        const row = result.recordset[0];
        res.json({
            officeId: row.office_id,
            officeName: row.office_name,
            officeSlug: row.office_slug,
            title: row.title,
            subtitle: row.subtitle,
            content: typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json,
            updatedAt: row.updated_at,
        });
    } catch (err) {
        console.error('Error fetching office guide:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/offices/:slug/guide (Admin update)
router.put('/offices/:slug/guide', authenticate, requireRole('location_admin', 'super_admin'), async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, subtitle, content } = req.body;
        const pool = await getPool();

        const officeResult = await pool.request()
            .input('slug', slug)
            .query('SELECT id FROM offices WHERE slug = @slug');

        if (officeResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Office not found' });
        }

        const officeId = officeResult.recordset[0].id;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

        await pool.request()
            .input('officeId', officeId)
            .input('title', title)
            .input('subtitle', subtitle || '')
            .input('contentJson', contentStr)
            .input('userId', req.user?.id || null)
            .query(`
                INSERT OR REPLACE INTO office_guides (office_id, title, subtitle, content_json, updated_by, updated_at)
                VALUES (@officeId, @title, @subtitle, @contentJson, @userId, datetime('now'))
            `);

        res.json({ message: 'Office guide updated successfully.' });
    } catch (err) {
        console.error('Error updating office guide:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;