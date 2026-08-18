import { Router } from 'express';
import { getPool } from '../config/database';

const router = Router();

// ── 1. GLOBE LEVEL: Get All Countries & Active Offices ──────────
router.get('/countries', async (_req, res) => {
    try {
        const pool = await getPool();
        const countriesResult = await pool.request().query(`
            SELECT 
                c.id, c.name, c.iso_code AS code, c.slug, c.latitude, c.longitude,
                COUNT(DISTINCT o.id) AS total_offices,
                COALESCE((
                    SELECT COUNT(d.id)
                    FROM desks d
                    JOIN zones z ON z.id = d.zone_id
                    JOIN floors f ON f.id = z.floor_id
                    JOIN offices off ON off.id = f.office_id
                    WHERE off.country_id = c.id
                ), 0) AS total_desks,
                COALESCE((
                    SELECT COUNT(mr.id)
                    FROM meeting_rooms mr
                    JOIN zones z ON z.id = mr.zone_id
                    JOIN floors f ON f.id = z.floor_id
                    JOIN offices off ON off.id = f.office_id
                    WHERE off.country_id = c.id
                ), 0) AS total_meeting_rooms,
                COALESCE((
                    SELECT COUNT(d.id)
                    FROM desks d
                    JOIN zones z ON z.id = d.zone_id
                    JOIN floors f ON f.id = z.floor_id
                    JOIN offices off ON off.id = f.office_id
                    WHERE off.country_id = c.id AND d.status = 'available'
                ), 0) AS available_desks
            FROM countries c
            LEFT JOIN offices o ON o.country_id = c.id
            GROUP BY c.id, c.name, c.iso_code, c.slug, c.latitude, c.longitude
            ORDER BY c.name ASC
        `);

        const officesResult = await pool.request().query(`
            SELECT 
                o.id, o.country_id, o.name, o.slug, o.latitude, o.longitude, o.address_line1, o.city, o.postcode,
                c.slug AS country_slug, c.name AS country_name,
                COALESCE((
                    SELECT COUNT(d.id)
                    FROM desks d
                    JOIN zones z ON z.id = d.zone_id
                    JOIN floors f ON f.id = z.floor_id
                    WHERE f.office_id = o.id
                ), 0) AS total_desks,
                COALESCE((
                    SELECT COUNT(d.id)
                    FROM desks d
                    JOIN zones z ON z.id = d.zone_id
                    JOIN floors f ON f.id = z.floor_id
                    WHERE f.office_id = o.id AND d.status = 'available'
                ), 0) AS available_desks
            FROM offices o
            JOIN countries c ON c.id = o.country_id
            WHERE o.is_active = 1
            ORDER BY o.name ASC
        `);

        const allOffices = officesResult.recordset.map((row: any) => ({
            id: row.id,
            countryId: row.country_id,
            name: row.name,
            slug: row.slug,
            countrySlug: row.country_slug,
            countryName: row.country_name,
            latitude: row.latitude,
            longitude: row.longitude,
            totalDesks: row.total_desks,
            availableDesks: row.available_desks,
            address: `${row.address_line1}, ${row.city}`,
        }));

        res.json(countriesResult.recordset.map((row: any) => ({
            id: row.id,
            name: row.name,
            code: row.code,
            slug: row.slug,
            latitude: row.latitude,
            longitude: row.longitude,
            officeCount: row.total_offices,
            totalOffices: row.total_offices,
            totalDesks: row.total_desks,
            totalMeetingRooms: row.total_meeting_rooms,
            availableDesks: row.available_desks,
            offices: allOffices.filter((o: any) => o.countryId === row.id),
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
                    o.id, o.name, o.slug, o.address_line1, o.city, o.postcode, o.floor_count,
                    o.latitude, o.longitude, o.photo_url AS image_url,
                    COALESCE((
                        SELECT COUNT(d.id)
                        FROM desks d
                        JOIN zones z ON z.id = d.zone_id
                        JOIN floors f ON f.id = z.floor_id
                        WHERE f.office_id = o.id
                    ), 0) AS total_desks,
                    COALESCE((
                        SELECT COUNT(mr.id)
                        FROM meeting_rooms mr
                        JOIN zones z ON z.id = mr.zone_id
                        JOIN floors f ON f.id = z.floor_id
                        WHERE f.office_id = o.id
                    ), 0) AS total_meeting_rooms,
                    COALESCE((
                        SELECT COUNT(d.id)
                        FROM desks d
                        JOIN zones z ON z.id = d.zone_id
                        JOIN floors f ON f.id = z.floor_id
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
            latitude: row.latitude,
            longitude: row.longitude,
            address: `${row.address_line1}, ${row.city} ${row.postcode}`,
            addressLine1: row.address_line1,
            city: row.city,
            postcode: row.postcode,
            floorsCount: row.floor_count,
            floorCount: row.floor_count,
            totalDesks: row.total_desks,
            totalMeetingRooms: row.total_meeting_rooms,
            availableDesks: row.available_desks,
            imageUrl: row.image_url,
            photoUrl: row.image_url,
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
                    o.id, o.name, o.slug, o.address_line1, o.city, o.postcode, o.floor_count,
                    o.photo_url AS image_url,
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
                    f.id, f.floor_number, f.name, f.slug,
                    COALESCE((
                        SELECT COUNT(d.id)
                        FROM desks d
                        JOIN zones z ON z.id = d.zone_id
                        WHERE z.floor_id = f.id
                    ), 0) AS total_desks,
                    COALESCE((
                        SELECT COUNT(mr.id)
                        FROM meeting_rooms mr
                        JOIN zones z ON z.id = mr.zone_id
                        WHERE z.floor_id = f.id
                    ), 0) AS total_meeting_rooms,
                    COALESCE((
                        SELECT COUNT(d.id)
                        FROM desks d
                        JOIN zones z ON z.id = d.zone_id
                        WHERE z.floor_id = f.id AND d.status = 'available'
                    ), 0) AS available_desks
                FROM floors f
                WHERE f.office_id = @officeId
                ORDER BY f.floor_number ASC
            `);

        res.json({
            id: office.id,
            name: office.name,
            slug: office.slug,
            address: `${office.address_line1}, ${office.city} ${office.postcode}`,
            floorsCount: office.floor_count,
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

// ── 4. FLOOR LEVEL: Get Floor Map with Desks, Rooms & Facilities ──
router.get('/floors/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const pool = await getPool();

        const floorResult = await pool.request()
            .input('slug', slug)
            .query(`
                SELECT 
                    f.id, f.floor_number, f.name, f.slug, f.plan_image_url,
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

        // Desks
        const desksResult = await pool.request()
            .input('floorId', floor.id)
            .query(`
                SELECT 
                    d.id, d.code AS desk_code, d.label, d.status, d.x AS position_x, d.y AS position_y,
                    d.equipment_tags, z.name AS zone_name, z.type AS zone_type,
                    u.first_name || ' ' || u.last_name AS current_user_name,
                    u.avatar_url AS current_user_avatar
                FROM desks d
                JOIN zones z ON z.id = d.zone_id
                LEFT JOIN bookings b ON b.resource_id = d.id 
                    AND b.resource_type = 'desk' 
                    AND b.status = 'confirmed'
                    AND datetime('now') BETWEEN datetime(b.start_time) AND datetime(b.end_time)
                LEFT JOIN users u ON u.id = b.user_id
                WHERE z.floor_id = @floorId
                ORDER BY d.code ASC
            `);

        // Meeting Rooms
        const roomsResult = await pool.request()
            .input('floorId', floor.id)
            .query(`
                SELECT mr.id, mr.name, mr.capacity, mr.equipment_tags, mr.requires_approval, mr.status
                FROM meeting_rooms mr
                JOIN zones z ON z.id = mr.zone_id
                WHERE z.floor_id = @floorId
                ORDER BY mr.name ASC
            `);

        // Facility Areas & Interactive Photo Hotspots
        const facResult = await pool.request()
            .input('floorId', floor.id)
            .query(`SELECT * FROM facility_areas WHERE floor_id = @floorId AND is_active = 1 ORDER BY name ASC`);

        const facilitiesWithHotspots = [];
        for (const fac of facResult.recordset) {
            const hsRes = await pool.request()
                .input('facId', fac.id)
                .query(`SELECT * FROM facility_hotspots WHERE facility_id = @facId ORDER BY title ASC`);
            
            facilitiesWithHotspots.push({
                id: fac.id,
                name: fac.name,
                type: fac.type,
                photoUrl: fac.photo_url,
                description: fac.description,
                hotspots: hsRes.recordset.map((h: any) => ({
                    id: h.id,
                    title: h.title,
                    itemName: h.item_name,
                    description: h.description,
                    instructions: h.instructions,
                    posX: h.pos_x,
                    posY: h.pos_y,
                    icon: h.icon,
                })),
            });
        }

        res.json({
            id: floor.id,
            floorNumber: floor.floor_number,
            name: floor.name,
            slug: floor.slug,
            planImageUrl: floor.plan_image_url,
            officeId: floor.office_id,
            officeName: floor.office_name,
            officeSlug: floor.office_slug,
            countryName: floor.country_name,
            countrySlug: floor.country_slug,
            desks: desksResult.recordset.map((d: any) => ({
                id: d.id,
                deskCode: d.desk_code,
                code: d.desk_code,
                label: d.label,
                type: d.zone_type || 'hot',
                status: d.current_user_name ? 'occupied' : d.status,
                posX: d.position_x,
                posY: d.position_y,
                x: d.position_x,
                y: d.position_y,
                equipmentTags: d.equipment_tags,
                zoneName: d.zone_name,
                currentUserName: d.current_user_name || null,
                currentUserAvatar: d.current_user_avatar || null,
            })),
            meetingRooms: roomsResult.recordset.map((r: any) => ({
                id: r.id,
                name: r.name,
                capacity: r.capacity,
                equipmentTags: r.equipment_tags,
                hasAv: true,
                hasVideoConf: true,
                requiresApproval: r.requires_approval === 1,
                status: r.status,
            })),
            facilities: facilitiesWithHotspots,
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
                    d.id, d.code AS desk_code, d.label, d.status,
                    f.name AS floor_name, f.slug AS floor_slug,
                    o.name AS office_name, o.slug AS office_slug,
                    c.slug AS country_slug
                FROM desks d
                JOIN zones z ON z.id = d.zone_id
                JOIN floors f ON f.id = z.floor_id
                JOIN offices o ON o.id = f.office_id
                JOIN countries c ON c.id = o.country_id
                WHERE LOWER(d.code) LIKE @q OR LOWER(COALESCE(d.label, '')) LIKE @q
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
                JOIN zones z ON z.id = mr.zone_id
                JOIN floors f ON f.id = z.floor_id
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
                    o.id, o.name, o.slug, o.address_line1, o.city, o.postcode,
                    c.name AS country_name, c.slug AS country_slug
                FROM offices o
                JOIN countries c ON c.id = o.country_id
                WHERE LOWER(o.name) LIKE @q OR LOWER(o.address_line1) LIKE @q OR LOWER(o.city) LIKE @q
                LIMIT 5
            `);

        // Search Colleagues
        const usersResult = await pool.request()
            .input('q', searchPattern)
            .query(`
                SELECT 
                    u.id, u.first_name, u.last_name, u.email, u.role, u.avatar_url,
                    b.resource_id, b.resource_type, b.start_time, b.end_time,
                    d.code AS desk_code, f.name AS floor_name, f.slug AS floor_slug,
                    o.name AS office_name, o.slug AS office_slug, c.slug AS country_slug
                FROM users u
                LEFT JOIN bookings b ON b.user_id = u.id 
                    AND b.status = 'confirmed'
                    AND datetime('now') BETWEEN datetime(b.start_time) AND datetime(b.end_time)
                LEFT JOIN desks d ON d.id = b.resource_id AND b.resource_type = 'desk'
                LEFT JOIN zones z ON z.id = d.zone_id
                LEFT JOIN floors f ON f.id = z.floor_id
                LEFT JOIN offices o ON o.id = f.office_id
                LEFT JOIN countries c ON c.id = o.country_id
                WHERE LOWER(u.first_name) LIKE @q OR LOWER(u.last_name) LIKE @q OR LOWER(u.email) LIKE @q
                LIMIT 5
            `);

        res.json({
            desks: desksResult.recordset.map((d: any) => ({
                id: d.id,
                deskCode: d.desk_code,
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
                address: `${o.address_line1}, ${o.city} ${o.postcode}`,
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


// GET /api/offices/:slug/floors
router.get('/offices/:slug/floors', async (req, res) => {
    try {
        const pool = await getPool();
        const officeRes = await pool.request()
            .input('slug', req.params.slug)
            .query('SELECT id FROM offices WHERE slug = @slug LIMIT 1');

        if (!officeRes.recordset?.length) {
            res.status(404).json({ error: 'Office not found' });
            return;
        }

        const officeId = officeRes.recordset[0].id;
        const floorsRes = await pool.request()
            .input('officeId', officeId)
            .query(`
                SELECT f.id, f.floor_number as floorNumber, f.name, f.slug
                FROM floors f
                WHERE f.office_id = @officeId
                ORDER BY f.floor_number ASC
            `);

        res.json(floorsRes.recordset || []);
    } catch (err) {
        console.error('Error fetching office floors:', err);
        res.status(500).json({ error: 'Failed to fetch office floors' });
    }
});

export default router;
