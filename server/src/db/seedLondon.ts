import { getPool } from '../config/database';

export const seedLondonAndAmenities = async () => {
    const pool = await getPool();

    // 1. Insert London Office
    const londonOfficeId = '66666666-6666-6666-6666-666666666666';
    const ukCountryId = '44444444-4444-4444-4444-444444444444';

    await pool.request()
        .input('id', londonOfficeId)
        .input('countryId', ukCountryId)
        .input('name', 'London Office (Brandwidth HQ)')
        .input('slug', 'london-hq')
        .input('addressLine1', 'Brandwidth HQ, 24 Clerkenwell Close')
        .input('city', 'London')
        .input('postcode', 'EC1R 0HL')
        .input('lat', 51.5235)
        .input('lng', -0.1054)
        .input('photoUrl', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80')
        .input('floorCount', 2)
        .input('hours', 'Mon-Fri 08:30 - 18:00')
        .query(`
            INSERT OR REPLACE INTO offices (
                id, country_id, name, slug, address_line1, city, postcode, 
                latitude, longitude, photo_url, floor_count, operational_hours, is_active
            )
            VALUES (
                @id, @countryId, @name, @slug, @addressLine1, @city, @postcode, 
                @lat, @lng, @photoUrl, @floorCount, @hours, 1
            )
        `);

    // 2. Floors for London
    const floorGId = '77777777-7777-7777-7777-777777777771';
    const floor1Id = '77777777-7777-7777-7777-777777777772';

    await pool.request()
        .input('id', floorGId)
        .input('officeId', londonOfficeId)
        .input('floorNumber', 0)
        .input('name', 'Ground Floor (Creative Studio & Client Lounge)')
        .input('slug', 'ground-floor')
        .query(`
            INSERT OR REPLACE INTO floors (id, office_id, floor_number, name, slug)
            VALUES (@id, @officeId, @floorNumber, @name, @slug)
        `);

    await pool.request()
        .input('id', floor1Id)
        .input('officeId', londonOfficeId)
        .input('floorNumber', 1)
        .input('name', 'First Floor (Engineering & Strategy Lab)')
        .input('slug', 'first-floor')
        .query(`
            INSERT OR REPLACE INTO floors (id, office_id, floor_number, name, slug)
            VALUES (@id, @officeId, @floorNumber, @name, @slug)
        `);

    // 3. Zones for London
    const zoneGStudio = 'z-lon-g-studio';
    const zoneGLounge = 'z-lon-g-lounge';
    const zoneGBoardroom = 'z-lon-g-turing';
    const zone1Eng = 'z-lon-1-eng';
    const zone1Strat = 'z-lon-1-strat';
    const zone1Lab = 'z-lon-1-lovelace';

    await pool.request().input('id', zoneGStudio).input('floorId', floorGId).input('name', 'Creative Design Studio').input('type', 'hot_desk').query("INSERT OR REPLACE INTO zones (id, floor_id, name, type) VALUES (@id, @floorId, @name, @type)");
    await pool.request().input('id', zoneGLounge).input('floorId', floorGId).input('name', 'Client Solutions Lounge').input('type', 'workspace').query("INSERT OR REPLACE INTO zones (id, floor_id, name, type) VALUES (@id, @floorId, @name, @type)");
    await pool.request().input('id', zoneGBoardroom).input('floorId', floorGId).input('name', 'Turing Innovation Suite').input('type', 'meeting_room').query("INSERT OR REPLACE INTO zones (id, floor_id, name, type) VALUES (@id, @floorId, @name, @type)");

    await pool.request().input('id', zone1Eng).input('floorId', floor1Id).input('name', 'Cloudfy Engineering Lab').input('type', 'workspace').query("INSERT OR REPLACE INTO zones (id, floor_id, name, type) VALUES (@id, @floorId, @name, @type)");
    await pool.request().input('id', zone1Strat).input('floorId', floor1Id).input('name', 'Digital Strategy Pods').input('type', 'hot_desk').query("INSERT OR REPLACE INTO zones (id, floor_id, name, type) VALUES (@id, @floorId, @name, @type)");
    await pool.request().input('id', zone1Lab).input('floorId', floor1Id).input('name', 'Lovelace Workshop').input('type', 'meeting_room').query("INSERT OR REPLACE INTO zones (id, floor_id, name, type) VALUES (@id, @floorId, @name, @type)");

    // 4. Meeting Rooms
    await pool.request().input('id', 'mr-lon-turing').input('zoneId', zoneGBoardroom).input('name', 'Turing Innovation Suite').input('capacity', 12).input('tags', '4K Presentation Display, Teams VC, Whiteboard').query("INSERT OR REPLACE INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES (@id, @zoneId, @name, @capacity, @tags, 1, 'available')");
    await pool.request().input('id', 'mr-lon-lovelace').input('zoneId', zone1Lab).input('name', 'Lovelace Creative Workshop').input('capacity', 8).input('tags', 'Digital Smartboard, Video Conf').query("INSERT OR REPLACE INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status) VALUES (@id, @zoneId, @name, @capacity, @tags, 0, 'available')");

    // 5. Desks for Ground Floor (12 desks)
    for (let i = 1; i <= 12; i++) {
        const deskId = `d-lon-g-${i}`;
        const code = `UK-LDN-GF-D${String(i).padStart(2, '0')}`;
        const zoneId = i <= 6 ? zoneGStudio : zoneGLounge;
        const tags = i % 2 === 0 ? 'Dual 4K, USB-C Dock, Ergonomic Chair' : 'UltraWide, USB-C Dock';
        const posX = ((i - 1) % 4) * 2.5 - 3.75;
        const posY = Math.floor((i - 1) / 4) * 3 - 1.5;

        await pool.request()
            .input('id', deskId)
            .input('zoneId', zoneId)
            .input('code', code)
            .input('label', `London Desk G${i}`)
            .input('x', posX)
            .input('y', posY)
            .input('tags', tags)
            .query(`
                INSERT OR REPLACE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags)
                VALUES (@id, @zoneId, @code, @label, @x, @y, 'available', 1, @tags)
            `);
    }

    // 6. Desks for First Floor (16 desks)
    for (let i = 1; i <= 16; i++) {
        const deskId = `d-lon-1f-${i}`;
        const code = `UK-LDN-1F-D${String(i).padStart(2, '0')}`;
        const zoneId = i <= 8 ? zone1Eng : zone1Strat;
        const tags = 'Dual 4K, Standing Desk, USB-C 100W Dock';
        const posX = ((i - 1) % 4) * 2.5 - 3.75;
        const posY = Math.floor((i - 1) / 4) * 2.5 - 3.75;

        await pool.request()
            .input('id', deskId)
            .input('zoneId', zoneId)
            .input('code', code)
            .input('label', `London Desk 1F-${i}`)
            .input('x', posX)
            .input('y', posY)
            .input('tags', tags)
            .query(`
                INSERT OR REPLACE INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags)
                VALUES (@id, @zoneId, @code, @label, @x, @y, 'available', 1, @tags)
            `);
    }

    // 7. London Welcome Guide
    const londonGuideContent = JSON.stringify({
        title: 'WELCOME TO BRANDWIDTH HQ LONDON',
        subtitle: '24 Clerkenwell Close, London EC1R 0HL • Creative & Engineering Hub',
        sections: [
            {
                id: 'arrival',
                title: 'Arrival & Commuting',
                icon: 'Navigation',
                items: [
                    { label: 'Address', value: 'Brandwidth HQ, 24 Clerkenwell Close, London EC1R 0HL.' },
                    { label: 'Public Transport', value: 'Farringdon Station (Elizabeth Line, Thameslink, Underground) is a 6-minute walk.' },
                    { label: 'Building Access', value: 'Digital smartcard on smartphone or physical keycard from reception desk.' },
                    { label: 'Cycling Facilities', value: 'Secure underground cycle racks and showers available on lower ground floor.' }
                ]
            },
            {
                id: 'workspaces',
                title: 'Workspaces & Collaboration',
                icon: 'Layers',
                items: [
                    { label: 'Ground Floor Studio', value: 'Agile design tables, collaboration pods, and Turing Boardroom.' },
                    { label: 'First Floor Engineering Lab', value: 'High-performance workstations with dual 4K monitors and Lovelace Workshop.' },
                    { label: 'Barista Bar & Kitchen', value: 'Specialty espresso machine, filtered sparkling water, and fresh snacks.' }
                ]
            },
            {
                id: 'hotspots',
                title: 'Clerkenwell Hotspots',
                icon: 'Coffee',
                items: [
                    { label: 'Coffee', value: 'Workshop Coffee & Look Mum No Hands on Old Street.' },
                    { label: 'Lunch', value: 'Exmouth Market artisan street food market (4-min walk).' },
                    { label: 'After Work', value: 'The Crown Tavern on Clerkenwell Green.' }
                ]
            }
        ]
    });

    await pool.request()
        .input('officeId', londonOfficeId)
        .input('title', 'WELCOME TO BRANDWIDTH HQ LONDON')
        .input('subtitle', '24 Clerkenwell Close, London EC1R 0HL • Creative & Engineering Hub')
        .input('content', londonGuideContent)
        .query(`
            INSERT OR REPLACE INTO office_guides (office_id, title, subtitle, content_json, updated_at)
            VALUES (@officeId, @title, @subtitle, @content, datetime('now'))
        `);

    console.log('[LONDON] London Office (Brandwidth HQ) spatial tree and guide seeded successfully.');
};

if (require.main === module) {
    seedLondonAndAmenities().then(() => process.exit(0));
}