import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';

async function seedIndiaOffice() {
    console.log('[SEED] Provisioning Cloudfy Ecommerce India Pvt Ltd (Noida Hub)...');
    const pool = await getPool();

    // 1. Ensure Country "India" exists
    const countryId = '77777777-7777-7777-7777-777777777777';
    await pool.request().query(`
        INSERT INTO countries (id, name, slug, iso_code, latitude, longitude)
        VALUES (
            '${countryId}',
            'India',
            'india',
            'IN',
            20.5937,
            78.9629
        )
        ON CONFLICT(slug) DO UPDATE SET 
            name = excluded.name,
            iso_code = excluded.iso_code,
            latitude = excluded.latitude,
            longitude = excluded.longitude;
    `);

    // 2. Insert or Update Office
    const officeId = '88888888-8888-8888-8888-888888888888';
    const officeSlug = 'cloudfy-india-noida';
    const officeName = 'Cloudfy Ecommerce India Pvt Ltd';

    await pool.request().query(`
        INSERT INTO offices (
            id, country_id, name, slug, address_line1, address_line2,
            city, postcode, latitude, longitude, photo_url, floor_count,
            operational_hours, is_active
        )
        VALUES (
            '${officeId}',
            '${countryId}',
            '${officeName}',
            '${officeSlug}',
            '3rd Floor, The Iconic Corenthum Tower C',
            'Block A, Industrial Area, Sector 62',
            'Noida',
            '201309',
            28.6280,
            77.3649,
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
            1,
            '09:00 - 18:30 IST',
            1
        )
        ON CONFLICT(slug) DO UPDATE SET
            name = excluded.name,
            address_line1 = excluded.address_line1,
            address_line2 = excluded.address_line2,
            city = excluded.city,
            postcode = excluded.postcode,
            latitude = excluded.latitude,
            longitude = excluded.longitude,
            photo_url = excluded.photo_url;
    `);

    // 3. Create Floor: 3rd Floor
    const floorId = '88888888-1111-4444-8888-888888888888';
    const floorSlug = '3rd-floor';

    await pool.request().query(`
        INSERT INTO floors (id, office_id, floor_number, name, slug, plan_image_url)
        VALUES (
            '${floorId}',
            '${officeId}',
            3,
            '3rd Floor (Corenthum Tower C)',
            '${floorSlug}',
            '/blueprints/floor-plan-sample.svg'
        )
        ON CONFLICT(office_id, floor_number) DO UPDATE SET
            name = excluded.name,
            slug = excluded.slug;
    `);

    // 4. Create Zones
    const devZoneId = uuidv4();
    const collabZoneId = uuidv4();

    await pool.request().query(`
        INSERT INTO zones (id, floor_id, name, type, capacity, x, y, width, height)
        VALUES
            ('${devZoneId}', '${floorId}', 'Engineering & Cloud Core', 'desks', 16, -5, -3, 6, 6),
            ('${collabZoneId}', '${floorId}', 'Collaboration & Agile Wing', 'meeting_rooms', 12, 2, -3, 6, 6)
        ON CONFLICT(id) DO NOTHING;
    `);

    // 5. Create 24 Workstations
    for (let i = 1; i <= 24; i++) {
        const deskId = `ind-desk-${i.toString().padStart(2, '0')}`;
        const code = `IND-D${i.toString().padStart(2, '0')}`;
        const label = i <= 12 ? `Engineering Pod ${Math.ceil(i / 4)}` : `Cloud Commerce Pod ${Math.ceil((i - 12) / 4)}`;
        const x = -4 + ((i - 1) % 6) * 1.6;
        const y = i <= 12 ? -2.5 + Math.floor((i - 1) / 6) * 1.5 : 1.2 + Math.floor((i - 13) / 6) * 1.5;
        const equipment = i % 2 === 0 ? 'Dual 4K Displays, Standing Desk, USB-C Dock' : 'Single 34" Curved 4K, USB-C Dock, Ergonomic Mesh';

        await pool.request().query(`
            INSERT INTO desks (id, zone_id, code, label, x, y, status, is_bookable, equipment_tags)
            VALUES (
                '${deskId}',
                '${i <= 12 ? devZoneId : collabZoneId}',
                '${code}',
                '${label}',
                ${x},
                ${y},
                'available',
                1,
                '${equipment}'
            )
            ON CONFLICT(id) DO UPDATE SET
                label = excluded.label,
                x = excluded.x,
                y = excluded.y,
                equipment_tags = excluded.equipment_tags;
        `);
    }

    // 6. Create Meeting Rooms
    const room1Id = uuidv4();
    const room2Id = uuidv4();

    await pool.request().query(`
        INSERT INTO meeting_rooms (id, zone_id, name, capacity, equipment_tags, requires_approval, status)
        VALUES
            ('${room1Id}', '${collabZoneId}', 'Lotus Executive Boardroom', 12, '4K Video Conf, Poly Studio Bar, Smart Whiteboard', 1, 'available'),
            ('${room2Id}', '${collabZoneId}', 'Ganges Innovation Pod', 6, 'Dual 55" Displays, Wireless Screen Share, Acoustic Insulation', 0, 'available')
        ON CONFLICT(id) DO NOTHING;
    `);

    // 7. Create Facility Areas & Photo Hotspots
    const cafeteriaFacId = uuidv4();
    const loungeFacId = uuidv4();

    await pool.request().query(`
        INSERT INTO facility_areas (id, floor_id, name, type, photo_url, description)
        VALUES
            ('${cafeteriaFacId}', '${floorId}', '3rd Floor Cafeteria & Chai Bar', 'kitchen', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200', 'Full-service refreshment bar with fresh authentic masala chai, South Indian filter coffee, and instant hot/chilled water.'),
            ('${loungeFacId}', '${floorId}', 'Recreation & Breakout Lounge', 'wellness', 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=1200', 'Comfortable relaxation and breakout zone featuring games, reading nook, and standing collaborative tables.')
        ON CONFLICT(id) DO NOTHING;
    `);

    // Hotspots for Cafeteria
    await pool.request().query(`
        INSERT INTO facility_hotspots (id, facility_id, title, item_name, description, instructions, pos_x, pos_y, icon)
        VALUES
            ('${uuidv4()}', '${cafeteriaFacId}', 'Authentic Masala Chai & Coffee Station', 'Hot Beverages', 'Freshly brewed tea leaves with cardamom, ginger, and steamed milk.', '1. Select tea cup from top rack. 2. Turn tap counter-clockwise for hot masala chai. 3. Sugar sachets located on side tray.', 32.5, 48.0, 'Coffee'),
            ('${uuidv4()}', '${cafeteriaFacId}', 'RO UV Purified Water Tap', 'Water Dispenser', 'Continuous multi-stage filtered chilled, ambient, and boiling water dispenser.', 'Press blue safety lock and press pad for instant pure drinking water.', 68.0, 52.0, 'Droplets'),
            ('${uuidv4()}', '${cafeteriaFacId}', 'Microwave & Warm Lunch Hub', 'Appliances', 'Dual high-power commercial microwaves for heating lunch.', 'Set timer dial to desired minutes and press start. Please wipe down after warming curries.', 84.0, 42.0, 'Flame')
        ON CONFLICT(id) DO NOTHING;
    `);

    // 8. Seed Welcome Guide for Noida
    const guideData = {
        title: 'WELCOME TO CLOUDFY NOIDA TECH HUB',
        subtitle: '3rd Floor, The Iconic Corenthum Tower C, Sector 62',
        sections: [
            {
                id: 'arrival',
                title: 'Arrival & Commuting',
                icon: 'Navigation',
                items: [
                    { label: 'Address', value: '3rd Floor, The Iconic Corenthum Tower C, Block A, Sector 62, Noida 201309' },
                    { label: 'Metro Transit', value: 'Noida Electronic City Metro Station (Blue Line) is 3 minutes away by auto or 10 minutes on foot.' },
                    { label: 'Building Access', value: 'Visitor sign-in at Tower C ground lobby, then proceed to 3rd floor reception.' },
                    { label: 'Parking', value: 'Basement Level 2 visitor parking with dedicated two-wheeler and four-wheeler bays.' }
                ]
            },
            {
                id: 'workspaces',
                title: 'Floor Layout & Facilities',
                icon: 'Layers',
                items: [
                    { label: 'Engineering Core', value: '16 high-spec developer workstations with dual 4K monitors and ergonomic mesh chairs.' },
                    { label: 'Lotus Boardroom', value: 'Executive boardroom with 4K video telepresence and Polycom smart bar.' },
                    { label: 'Cafeteria & Chai Bar', value: 'Complimentary morning snacks, fruit, fresh masala chai, and South Indian filter coffee.' },
                    { label: 'Breakout Lounge', value: 'Comfortable relaxation zone with games and casual collaborative seating.' }
                ]
            },
            {
                id: 'it_wifi',
                title: 'IT & Connectivity',
                icon: 'Wifi',
                items: [
                    { label: 'Wi-Fi Network', value: 'Connect to "Cloudfy-India-Secure" using your corporate credentials.' },
                    { label: 'Docking Stations', value: 'USB-C universal power delivery docks at every workstation.' },
                    { label: 'IT Helpdesk', value: 'Contact local IT team at Ext #304 for any peripheral or network assistance.' }
                ]
            },
            {
                id: 'local_area',
                title: 'Local Area & Dining',
                icon: 'Coffee',
                items: [
                    { label: 'Food Court', value: 'The Corenthum ground floor food court offers Subway, Haldiram\'s, Chai Point, and North Indian meals.' },
                    { label: 'Medical Emergency', value: 'Fortis Hospital Noida (Sector 62) is 5 minutes drive away.' }
                ]
            }
        ],
        footerBanner: 'Welcome to Cloudfy India! Creating exceptional global digital commerce experiences.'
    };

    const guideJson = JSON.stringify(guideData);

    await pool.request()
        .input('officeId', officeId)
        .input('title', guideData.title)
        .input('subtitle', guideData.subtitle)
        .input('contentJson', guideJson)
        .query(`
            INSERT OR REPLACE INTO office_guides (office_id, title, subtitle, content_json, updated_at)
            VALUES (@officeId, @title, @subtitle, @contentJson, datetime('now'))
        `);

    console.log('[SUCCESS] Cloudfy Ecommerce India Pvt Ltd (Noida Hub) seeded successfully!');
}

seedIndiaOffice().then(() => process.exit(0)).catch((err) => {
    console.error('[ERROR] Failed to seed India office:', err);
    process.exit(1);
});