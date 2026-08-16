import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/favourites/desks - Get all favourite desks for current user
router.get('/desks', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;
        const pool = await getPool();

        const result = await pool.request()
            .input('userId', userId)
            .query(`
                SELECT 
                    fd.id as favourite_id,
                    fd.created_at as saved_at,
                    d.id as desk_id,
                    d.code as desk_code,
                    d.label as desk_label,
                    d.equipment_tags,
                    d.status as desk_status,
                    d.is_bookable,
                    z.name as zone_name,
                    f.id as floor_id,
                    f.name as floor_name,
                    f.slug as floor_slug,
                    f.floor_number,
                    o.id as office_id,
                    o.name as office_name,
                    o.slug as office_slug,
                    o.city as office_city,
                    c.slug as country_slug,
                    c.name as country_name
                FROM favourite_desks fd
                JOIN desks d ON fd.desk_id = d.id
                JOIN zones z ON d.zone_id = z.id
                JOIN floors f ON z.floor_id = f.id
                JOIN offices o ON f.office_id = o.id
                JOIN countries c ON o.country_id = c.id
                WHERE fd.user_id = @userId
                ORDER BY fd.created_at DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching favourite desks:', err);
        res.status(500).json({ error: 'Failed to fetch favourite desks' });
    }
});

// POST /api/favourites/desks/:deskId - Add desk to favourites
router.post('/desks/:deskId', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;
        const deskId = req.params.deskId;
        const pool = await getPool();

        const id = uuidv4();
        await pool.request()
            .input('id', id)
            .input('userId', userId)
            .input('deskId', deskId)
            .query(`
                INSERT INTO favourite_desks (id, user_id, desk_id)
                VALUES (@id, @userId, @deskId)
                ON CONFLICT(user_id, desk_id) DO NOTHING;
            `);

        res.json({ message: 'Desk added to favourites', deskId, isFavourite: true });
    } catch (err) {
        console.error('Error adding favourite desk:', err);
        res.status(500).json({ error: 'Failed to add favourite desk' });
    }
});

// DELETE /api/favourites/desks/:deskId - Remove desk from favourites
router.delete('/desks/:deskId', authenticate, async (req, res) => {
    try {
        const userId = req.user!.id;
        const deskId = req.params.deskId;
        const pool = await getPool();

        await pool.request()
            .input('userId', userId)
            .input('deskId', deskId)
            .query(`
                DELETE FROM favourite_desks
                WHERE user_id = @userId AND desk_id = @deskId
            `);

        res.json({ message: 'Desk removed from favourites', deskId, isFavourite: false });
    } catch (err) {
        console.error('Error removing favourite desk:', err);
        res.status(500).json({ error: 'Failed to remove favourite desk' });
    }
});

export default router;