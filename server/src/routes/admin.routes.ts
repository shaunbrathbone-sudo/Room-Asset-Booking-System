import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(requireRole('super_admin', 'location_admin', 'facility_manager', 'admin'));

// ── 1. DOMAIN WHITELIST MANAGEMENT ──────────────────────────────
router.get('/domains', async (_req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT id, domain, tenant_name, is_active, created_at
            FROM allowed_domains
            ORDER BY domain ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching domains:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/domains', async (req, res) => {
    try {
        const { domain, tenantName } = req.body;
        if (!domain) return res.status(400).json({ error: 'Domain is required' });

        const pool = await getPool();
        const id = uuidv4();
        const cleanDomain = domain.toLowerCase().trim().replace(/^@/, '');

        await pool.request()
            .input('id', id)
            .input('domain', cleanDomain)
            .input('tenantName', tenantName || 'Corporate')
            .query(`
                INSERT INTO allowed_domains (id, domain, tenant_name, is_active)
                VALUES (@id, @domain, @tenantName, 1)
            `);

        res.status(201).json({ message: 'Domain whitelisted successfully', id, domain: cleanDomain });
    } catch (err) {
        console.error('Error adding domain:', err);
        res.status(500).json({ error: 'Failed to whitelist domain' });
    }
});

router.delete('/domains/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();
        await pool.request().input('id', id).query('DELETE FROM allowed_domains WHERE id = @id');
        res.json({ message: 'Domain removed from whitelist' });
    } catch (err) {
        console.error('Error deleting domain:', err);
        res.status(500).json({ error: 'Failed to delete domain' });
    }
});

// ── 2. OFFICE ONBOARDING WIZARD (Transactional Creation) ────────
router.post('/offices/wizard', async (req, res) => {
    try {
        const {
            name, slug, countryId, addressLine1, addressLine2, city, postcode,
            latitude, longitude, photoUrl, floorCount = 1, operationalHours = '08:30 - 18:00',
            tenants = [], floorsList = [], deskCountPerFloor = 12, meetingRoomCountPerFloor = 1
        } = req.body;

        if (!name || !countryId || !addressLine1 || !city || !postcode) {
            return res.status(400).json({ error: 'Missing required office address fields.' });
        }

        const pool = await getPool();
        const officeId = uuidv4();
        const officeSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // 1. Insert Office
        await pool.request()
            .input('id', officeId)
            .input('countryId', countryId)
            .input('name', name)
            .input('slug', officeSlug)
            .input('addressLine1', addressLine1)
            .input('addressLine2', addressLine2 || null)
            .input('city', city)
            .input('postcode', postcode)
            .input('lat', Number(latitude) || 52.6339)
            .input('lng', Number(longitude) || -1.1360)
            .input('photoUrl', photoUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200')
            .input('floorCount', Number(floorCount) || 1)
            .input('hours', operationalHours)
            .query(`
                INSERT INTO offices (id, country_id, name, slug, address_line1, address_line2, city, postcode, latitude, longitude, photo_url, floor_count, operational_hours, is_active)
                VALUES (@id, @countryId, @name, @slug, @addressLine1, @addressLine2, @city, @postcode, @lat, @lng, @photoUrl, @floorCount, @hours, 1)
            `);

        // 2. Insert Tenants
        for (const tenantId of tenants) {
            await pool.request()
                .input('officeId', officeId)
                .input('tenantId', tenantId)
                .query(`INSERT OR IGNORE INTO office_tenants (office_id, tenant_id) VALUES (@officeId, @tenantId)`);
        }

        // 3. Create Floors, Default Zones, Desks & Meeting Rooms
        const targetFloors = floorsList.length > 0 ? floorsList : Array.from({ length: Number(floorCount) || 1 }, (_, i) => ({
            floorNumber: i,
            name: i === 0 ? 'Ground Floor' : `Floor ${i}`,
            slug: i === 0 ? 'ground-floor' : `floor-${i}`
        }));

        for (const f of targetFloors) {
            const floorId = uuidv4();
            await pool.request()
                .input('id', floorId)
                .input('officeId', officeId)
                .input('floorNum', f.floorNumber)
                .input('name', f.name)
                .input('slug', f.slug)
                .query(`INSERT INTO floors (id, office_id, floor_number, name, slug) VALUES (@id, @officeId, @floorNum, @name, @slug)`);

            // Create default zone
            const zoneId = uuidv4();
            await pool.request()
                .input('id', zoneId)
                .input('floorId', floorId)
                .input('name', `${f.name} Workspace`)
                .input('type', 'workspace')
                .query(`INSERT INTO zones (id, floor_id, name, type) VALUES (@id, @floorId, @name, @type)`);

            // Create initial desks
            const countDesks = Number(deskCountPerFloor) || 12;
            for (let d = 1; d <= countDesks; d++) {
                const deskId = uuidv4();
                const code = `${officeSlug.substring(0, 3).toUpperCase()}-F${f.floorNumber}-D${String(d).padStart(2, '0')}`;
                await pool.request()
                    .input('id', deskId)
                    .input('zoneId', zoneId)
                    .input('code', code)
                    .input('label', `Desk ${d}`)
                    .input('x', ((d - 1) % 4) * 2.5 - 3.75)
                    .input('y', Math.floor((d - 1) / 4) * 2.5 - 2.5)
                    .input('tags', 'Dual 4K, USB-C Dock')
                    .query(`
                        INSERT INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags)
                        VALUES (@id, @zoneId, @code, @label, @x, @y, 'available', 1, @tags)
                    `);
            }

            // Create meeting room if requested
            if (meetingRoomCountPerFloor > 0) {
                const roomId = uuidv4();
                await pool.request()
                    .input('id', roomId)
                    .input('zoneId', zoneId)
                    .input('name', `${f.name} Innovation Room`)
                    .input('capacity', 8)
                    .input('tags', '4K TV, Video Conference, Whiteboard')
                    .query(`
                        INSERT INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status)
                        VALUES (@id, @zoneId, @name, @capacity, @tags, 0, 'available')
                    `);
            }
        }

        // 4. Create Starter Welcome Guide
        const starterGuide = JSON.stringify({
            title: `WELCOME TO ${name.toUpperCase()}`,
            subtitle: `${addressLine1}, ${city} ${postcode}`,
            sections: [
                {
                    id: 'arrival',
                    title: 'Arrival & Access',
                    icon: 'Navigation',
                    items: [
                        { label: 'Address', value: `${addressLine1}, ${city} ${postcode}` },
                        { label: 'Building Hours', value: operationalHours },
                        { label: 'Security & Access', value: 'Present digital badge or keycard at main reception.' }
                    ]
                },
                {
                    id: 'workspaces',
                    title: 'Workspaces & Facilities',
                    icon: 'Layers',
                    items: [
                        { label: 'Desks', value: 'High-speed network docks with Dual 4K display monitors.' },
                        { label: 'Kitchen & Refreshments', value: 'Complimentary tea, espresso coffee & filtered water.' }
                    ]
                }
            ]
        });

        await pool.request()
            .input('officeId', officeId)
            .input('title', `WELCOME TO ${name.toUpperCase()}`)
            .input('subtitle', `${addressLine1}, ${city} ${postcode}`)
            .input('content', starterGuide)
            .query(`
                INSERT OR REPLACE INTO office_guides (office_id, title, subtitle, content_json, updated_at)
                VALUES (@officeId, @title, @subtitle, @content, datetime('now'))
            `);

        res.status(201).json({
            message: 'Office onboarded successfully via wizard!',
            officeId,
            slug: officeSlug,
            floorsCreated: targetFloors.length,
        });
    } catch (err) {
        console.error('Wizard onboarding error:', err);
        res.status(500).json({ error: 'Failed to onboard office through wizard' });
    }
});

// ── 3. INTERACTIVE FLOOR & FACILITY HOTSPOT EDITOR API ──────────
router.get('/offices/:slug/floor-editor', async (req, res) => {
    try {
        const { slug } = req.params;
        const pool = await getPool();

        const officeRes = await pool.request().input('slug', slug).query('SELECT * FROM offices WHERE slug = @slug');
        if (officeRes.recordset.length === 0) return res.status(404).json({ error: 'Office not found' });
        const office = officeRes.recordset[0];

        const floorsRes = await pool.request().input('officeId', office.id).query('SELECT * FROM floors WHERE office_id = @officeId ORDER BY floor_number ASC');

        const floorsWithData = [];
        for (const floor of floorsRes.recordset) {
            // Desks
            const desksRes = await pool.request().input('floorId', floor.id).query(`
                SELECT d.*, z.name as zone_name, z.type as zone_type
                FROM desks d
                JOIN zones z ON z.id = d.zone_id
                WHERE z.floor_id = @floorId
                ORDER BY d.code ASC
            `);

            // Facilities
            const facRes = await pool.request().input('floorId', floor.id).query(`
                SELECT * FROM facility_areas WHERE floor_id = @floorId ORDER BY name ASC
            `);

            const facilitiesWithHotspots = [];
            for (const fac of facRes.recordset) {
                const hsRes = await pool.request().input('facId', fac.id).query(`
                    SELECT * FROM facility_hotspots WHERE facility_id = @facId ORDER BY title ASC
                `);
                facilitiesWithHotspots.push({
                    ...fac,
                    hotspots: hsRes.recordset,
                });
            }

            floorsWithData.push({
                ...floor,
                desks: desksRes.recordset,
                facilities: facilitiesWithHotspots,
            });
        }

        res.json({
            office,
            floors: floorsWithData,
        });
    } catch (err) {
        console.error('Error fetching floor editor data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── 4. SAVE DESK CANVAS LAYOUT & PHOTO ──────────────────────────
router.post('/desks/:id/layout', async (req, res) => {
    try {
        const { id } = req.params;
        const { x, y, label, equipmentTags, isBookable } = req.body;

        const pool = await getPool();
        await pool.request()
            .input('id', id)
            .input('x', Number(x))
            .input('y', Number(y))
            .input('label', label || null)
            .input('equipment', equipmentTags || null)
            .input('bookable', isBookable === false ? 0 : 1)
            .query(`
                UPDATE desks
                SET x = @x, y = @y, label = @label, equipment_tags = @equipment, is_bookable = @bookable, updated_at = datetime('now')
                WHERE id = @id
            `);

        res.json({ message: 'Desk layout updated successfully' });
    } catch (err) {
        console.error('Error updating desk layout:', err);
        res.status(500).json({ error: 'Failed to update desk layout' });
    }
});

// ── 5. FACILITY AREA & PHOTO HOTSPOTS CRUD ──────────────────────
router.post('/floors/:floorId/facilities', async (req, res) => {
    try {
        const { floorId } = req.params;
        const { name, type, photoUrl, description } = req.body;

        if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

        const pool = await getPool();
        const facilityId = uuidv4();

        await pool.request()
            .input('id', facilityId)
            .input('floorId', floorId)
            .input('name', name)
            .input('type', type)
            .input('photoUrl', photoUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200')
            .input('desc', description || null)
            .query(`
                INSERT INTO facility_areas (id, floor_id, name, type, photo_url, description)
                VALUES (@id, @floorId, @name, @type, @photoUrl, @desc)
            `);

        res.status(201).json({ message: 'Facility area created', facilityId });
    } catch (err) {
        console.error('Error creating facility area:', err);
        res.status(500).json({ error: 'Failed to create facility area' });
    }
});

router.post('/facilities/:facilityId/hotspots', async (req, res) => {
    try {
        const { facilityId } = req.params;
        const { title, itemName, description, instructions, posX, posY, icon = 'Info' } = req.body;

        if (!title || posX === undefined || posY === undefined) {
            return res.status(400).json({ error: 'Title, posX, and posY are required for hotspot' });
        }

        const pool = await getPool();
        const hotspotId = uuidv4();

        await pool.request()
            .input('id', hotspotId)
            .input('facId', facilityId)
            .input('title', title)
            .input('item', itemName || title)
            .input('desc', description || null)
            .input('inst', instructions || null)
            .input('x', Number(posX))
            .input('y', Number(posY))
            .input('icon', icon)
            .query(`
                INSERT INTO facility_hotspots (id, facility_id, title, item_name, description, instructions, pos_x, pos_y, icon)
                VALUES (@id, @facId, @title, @item, @desc, @inst, @x, @y, @icon)
            `);

        res.status(201).json({ message: 'Photo hotspot pinned successfully', hotspotId });
    } catch (err) {
        console.error('Error creating hotspot:', err);
        res.status(500).json({ error: 'Failed to create hotspot' });
    }
});

router.delete('/hotspots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();
        await pool.request().input('id', id).query('DELETE FROM facility_hotspots WHERE id = @id');
        res.json({ message: 'Hotspot removed' });
    } catch (err) {
        console.error('Error deleting hotspot:', err);
        res.status(500).json({ error: 'Failed to delete hotspot' });
    }
});

export default router;