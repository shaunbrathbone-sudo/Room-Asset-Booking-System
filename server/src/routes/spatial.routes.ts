import { Router } from 'express';
import { getPool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// ── 1. GLOBE LEVEL: Get All Countries ───────────────────────────
router.get('/countries', async (_req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT 
                c.id, c.name, c.code, c.slug, c.latitude, c.longitude,
                COUNT(DISTINCT o.id) AS total_offices,
                COALESCE(SUM(o.total_desks), 0) AS total_desks,
                COALESCE(SUM(o.total_meeting_rooms), 0) AS total_meeting_rooms,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM desks d 
                    JOIN floors f ON f.id = d.floor_id 
                    JOIN offices off ON off.id = f.office_id 
                    WHERE off.country_id = c.id AND d.status = 'available'
                ), 0) AS available_desks
            FROM countries c
            LEFT JOIN offices o ON o.country_id = c.id
            GROUP BY c.id, c.name, c.code, c.slug, c.latitude, c.longitude
            ORDER BY c.name ASC
        `);

        res.json(result.recordset.map((row: any) => ({
            id: row.id,
            name: row.name,
            code: row.code,
            slug: row.slug,
            latitude: row.latitude,
            longitude: row.longitude,
            totalOffices: row.total_offices,
            totalDesks: row.total_desks,
            totalMeetingRooms: row.total_meeting_rooms,
            availableDesks: row.available_desks,
        })));
    } catch (err) {
        console.error('Error fetching countries:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── 2. COUNTRY LEVEL: Get Offices in a Country ──────────────────
router.get('/countries/:slug/offices', async (req, res) => {
    try {
        const { slug } = req.params;
        const pool = await getPool();

        const result = await pool.request()
            .input('slug', slug)
            .query(`
                SELECT 
                    o.id, o.name, o.slug, o.address, o.timezone, o.floors_count,
                    o.total_desks, o.total_meeting_rooms, o.image_url,
                    COALESCE((
                        SELECT COUNT(*) 
                        FROM desks d 
                        JOIN floors f ON f.id = d.floor_id 
                        WHERE f.office_id = o.id AND d.status = 'available'
                    ), 0) AS available_desks,
                    c.name AS country_name, c.slug AS country_slug
                FROM offices o
                JOIN countries c ON c.id = o.country_id
                WHERE c.slug = @slug
                ORDER BY o.name ASC
            `);

        res.json(result.recordset.map((row: any) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            address: row.address,
            timezone: row.timezone,
            floorsCount: row.floors_count,
            totalDesks: row.total_desks,
            totalMeetingRooms: row.total_meeting_rooms,
            availableDesks: row.available_desks,
            imageUrl: row.image_url,
            countryName: row.country_name,
            countrySlug: row.country_slug,
        })));
    } catch (err) {
        console.error('Error fetching country offices:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── 3. OFFICE LEVEL: Get Building Exploded Stack & Floors ───────
router.get('/offices/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const pool = await getPool();

        const officeResult = await pool.request()
            .input('slug', slug)
            .query(`
                SELECT 
                    o.id, o.name, o.slug, o.address, o.timezone, o.floors_count,
                    o.total_desks, o.total_meeting_rooms, o.image_url,
                    c.name AS country_name, c.slug AS country_slug
                FROM offices o
                JOIN countries c ON c.id = o.country_id
                WHERE o.slug = @slug
            `);

        if (officeResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Office not found' });
        }

        const office = officeResult.recordset[0];

        const floorsResult = await pool.request()
            .input('officeId', office.id)
            .query(`
                SELECT 
                    f.id, f.floor_number, f.name, f.slug, f.total_desks, f.total_meeting_rooms,
                    COALESCE((
                        SELECT COUNT(*) FROM desks d WHERE d.floor_id = f.id AND d.status = 'available'
                    ), 0) AS available_desks
                FROM floors f
                WHERE f.office_id = @officeId
                ORDER BY f.floor_number ASC
            `);

        res.json({
            id: office.id,
            name: office.name,
            slug: office.slug,
            address: office.address,
            timezone: office.timezone,
            floorsCount: office.floors_count,
            totalDesks: office.total_desks,
            totalMeetingRooms: office.total_meeting_rooms,
            imageUrl: office.image_url,
            countryName: office.country_name,
            countrySlug: office.country_slug,
            floors: floorsResult.recordset.map((f: any) => ({
                id: f.id,
                floorNumber: f.floor_number,
                name: f.name,
                slug: f.slug,
                totalDesks: f.total_desks,
                totalMeetingRooms: f.total_meeting_rooms,
                availableDesks: f.available_desks,
            })),
        });
    } catch (err) {
        console.error('Error fetching office details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── 4. FLOOR LEVEL: Get Floor Map with Desks & Meeting Rooms ───
router.get('/floors/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const pool = await getPool();

        const floorResult = await pool.request()
            .input('slug', slug)
            .query(`
                SELECT 
                    f.id, f.floor_number, f.name, f.slug, f.total_desks, f.total_meeting_rooms,
                    o.id AS office_id, o.name AS office_name, o.slug AS office_slug,
                    c.name AS country_name, c.slug AS country_slug
                FROM floors f
                JOIN offices o ON o.id = f.office_id
                JOIN countries c ON c.id = o.country_id
                WHERE f.slug = @slug
            `);

        if (floorResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Floor not found' });
        }

        const floor = floorResult.recordset[0];

        const desksResult = await pool.request()
            .input('floorId', floor.id)
            .query(`
                SELECT 
                    d.id, d.desk_code, d.type, d.status, d.position_x, d.position_y,
                    u.first_name || ' ' || u.last_name AS current_user_name,
                    u.avatar_url AS current_user_avatar
                FROM desks d
                LEFT JOIN bookings b ON b.resource_id = d.id 
                    AND b.resource_type = 'desk' 
                    AND b.status = 'confirmed'
                    AND datetime('now') BETWEEN datetime(b.start_time) AND datetime(b.end_time)
                LEFT JOIN users u ON u.id = b.user_id
                WHERE d.floor_id = @floorId
                ORDER BY d.desk_code ASC
            `);

        const roomsResult = await pool.request()
            .input('floorId', floor.id)
            .query(`
                SELECT id, name, capacity, has_av, has_video_conf, status
                FROM meeting_rooms
                WHERE floor_id = @floorId
                ORDER BY name ASC
            `);

        res.json({
            id: floor.id,
            floorNumber: floor.floor_number,
            name: floor.name,
            slug: floor.slug,
            totalDesks: floor.total_desks,
            totalMeetingRooms: floor.total_meeting_rooms,
            officeId: floor.office_id,
            officeName: floor.office_name,
            officeSlug: floor.office_slug,
            countryName: floor.country_name,
            countrySlug: floor.country_slug,
            desks: desksResult.recordset.map((d: any) => ({
                id: d.id,
                deskCode: d.desk_code,
                type: d.type,
                status: d.current_user_name ? 'occupied' : d.status,
                posX: d.position_x,
                posY: d.position_y,
                currentUserName: d.current_user_name || null,
                currentUserAvatar: d.current_user_avatar || null,
            })),
            meetingRooms: roomsResult.recordset.map((r: any) => ({
                id: r.id,
                name: r.name,
                capacity: r.capacity,
                hasAv: r.has_av === 1,
                hasVideoConf: r.has_video_conf === 1,
                status: r.status,
            })),
        });
    } catch (err) {
        console.error('Error fetching floor layout:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── 5. DIRECT UNIVERSAL SEARCH ──────────────────────────────────
router.get('/search', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim().toLowerCase();
        if (!q || q.length < 2) {
            return res.json({ desks: [], meetingRooms: [], offices: [], colleagues: [] });
        }

        const pool = await getPool();
        const searchPattern = `%${q}%`;

        // Search Desks
        const desksResult = await pool.request()
            .input('q', searchPattern)
            .query(`
                SELECT 
                    d.id, d.desk_code, d.type, d.status,
                    f.name AS floor_name, f.slug AS floor_slug,
                    o.name AS office_name, o.slug AS office_slug,
                    c.slug AS country_slug
                FROM desks d
                JOIN floors f ON f.id = d.floor_id
                JOIN offices o ON o.id = f.office_id
                JOIN countries c ON c.id = o.country_id
                WHERE LOWER(d.desk_code) LIKE @q OR LOWER(d.type) LIKE @q
                LIMIT 5
            `);

        // Search Meeting Rooms
        const roomsResult = await pool.request()
            .input('q', searchPattern)
            .query(`
                SELECT 
                    mr.id, mr.name, mr.capacity, mr.status,
                    f.name AS floor_name, f.slug AS floor_slug,
                    o.name AS office_name, o.slug AS office_slug,
                    c.slug AS country_slug
                FROM meeting_rooms mr
                JOIN floors f ON f.id = mr.floor_id
                JOIN offices o ON o.id = f.office_id
                JOIN countries c ON c.id = o.country_id
                WHERE LOWER(mr.name) LIKE @q
                LIMIT 5
            `);

        // Search Offices
        const officesResult = await pool.request()
            .input('q', searchPattern)
            .query(`
                SELECT 
                    o.id, o.name, o.slug, o.address,
                    c.name AS country_name, c.slug AS country_slug
                FROM offices o
                JOIN countries c ON c.id = o.country_id
                WHERE LOWER(o.name) LIKE @q OR LOWER(o.address) LIKE @q
                LIMIT 5
            `);

        // Search Colleagues
        const usersResult = await pool.request()
            .input('q', searchPattern)
            .query(`
                SELECT 
                    u.id, u.first_name, u.last_name, u.email, u.role, u.avatar_url,
                    b.resource_id, b.resource_type, b.start_time, b.end_time,
                    d.desk_code, f.name AS floor_name, f.slug AS floor_slug,
                    o.name AS office_name, o.slug AS office_slug, c.slug AS country_slug
                FROM users u
                LEFT JOIN bookings b ON b.user_id = u.id 
                    AND b.status = 'confirmed'
                    AND datetime('now') BETWEEN datetime(b.start_time) AND datetime(b.end_time)
                LEFT JOIN desks d ON d.id = b.resource_id AND b.resource_type = 'desk'
                LEFT JOIN floors f ON f.id = d.floor_id
                LEFT JOIN offices o ON o.id = f.office_id
                LEFT JOIN countries c ON c.id = o.country_id
                WHERE LOWER(u.first_name) LIKE @q OR LOWER(u.last_name) LIKE @q OR LOWER(u.email) LIKE @q
                LIMIT 5
            `);

        res.json({
            desks: desksResult.recordset.map((d: any) => ({
                id: d.id,
                deskCode: d.desk_code,
                type: d.type,
                status: d.status,
                floorName: d.floor_name,
                floorSlug: d.floor_slug,
                officeName: d.office_name,
                officeSlug: d.office_slug,
                countrySlug: d.country_slug,
                url: `/explore/${d.country_slug}/${d.office_slug}/${d.floor_slug}?deskId=${d.id}`,
            })),
            meetingRooms: roomsResult.recordset.map((r: any) => ({
                id: r.id,
                name: r.name,
                capacity: r.capacity,
                status: r.status,
                floorName: r.floor_name,
                floorSlug: r.floor_slug,
                officeName: r.office_name,
                officeSlug: r.office_slug,
                countrySlug: r.country_slug,
                url: `/explore/${r.country_slug}/${r.office_slug}/${r.floor_slug}?roomId=${r.id}`,
            })),
            offices: officesResult.recordset.map((o: any) => ({
                id: o.id,
                name: o.name,
                address: o.address,
                url: `/explore/${o.country_slug}/${o.slug}`,
            })),
            colleagues: usersResult.recordset.map((u: any) => ({
                id: u.id,
                fullName: `${u.first_name} ${u.last_name}`,
                email: u.email,
                role: u.role,
                avatarUrl: u.avatar_url,
                currentDesk: u.desk_code ? `${u.desk_code} (${u.floor_name}, ${u.office_name})` : 'Not Checked In',
                url: u.floor_slug ? `/explore/${u.country_slug}/${u.office_slug}/${u.floor_slug}?deskId=${u.resource_id}` : '/explore',
            })),
        });
    } catch (err) {
        console.error('Direct search error:', err);
        res.status(500).json({ error: 'Internal server error during search' });
    }
});

export default router;