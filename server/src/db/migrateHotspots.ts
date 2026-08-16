import { getPool } from '../config/database';

export const migrateHotspotsAndWizard = async () => {
    const pool = await getPool();

    // Create facility_areas table
    await pool.request().query(`
        CREATE TABLE IF NOT EXISTS facility_areas (
            id          TEXT PRIMARY KEY,
            floor_id    TEXT NOT NULL REFERENCES floors(id),
            name        TEXT NOT NULL,
            type        TEXT NOT NULL,
            photo_url   TEXT,
            description TEXT,
            is_active   INTEGER NOT NULL DEFAULT 1,
            created_at  TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // Create facility_hotspots table
    await pool.request().query(`
        CREATE TABLE IF NOT EXISTS facility_hotspots (
            id           TEXT PRIMARY KEY,
            facility_id  TEXT NOT NULL REFERENCES facility_areas(id) ON DELETE CASCADE,
            title        TEXT NOT NULL,
            item_name    TEXT,
            description  TEXT,
            instructions TEXT,
            pos_x        REAL NOT NULL,
            pos_y        REAL NOT NULL,
            icon         TEXT DEFAULT 'Info',
            created_at   TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    // Seed sample facility areas with rich photo hotspots for 17 Friar Lane & London HQ!
    const leicesterGfId = '66666666-6666-6666-6666-666666666666';
    const leicester1fId = '77777777-7777-7777-7777-777777777777';
    const londonGfId = '77777777-7777-7777-7777-777777777771';

    // 1. Leicester Ground Floor Kitchen
    const facLeiGfKitchen = 'fac-lei-gf-kitchen';
    await pool.request()
        .input('id', facLeiGfKitchen)
        .input('floorId', leicesterGfId)
        .input('name', 'Ground Floor Kitchenette & Coffee Lounge')
        .input('type', 'kitchen')
        .input('photoUrl', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80')
        .input('desc', 'Modern open kitchenette with barista espresso station, organic snacks, and recycling center.')
        .query(`
            INSERT OR REPLACE INTO facility_areas (id, floor_id, name, type, photo_url, description)
            VALUES (@id, @floorId, @name, @type, @photoUrl, @desc)
        `);

    // Hotspots for Leicester GF Kitchen
    await pool.request()
        .input('id', 'hs-lei-k1')
        .input('facId', facLeiGfKitchen)
        .input('title', 'Sage Barista Touch Espresso Machine')
        .input('item', 'Coffee Machine')
        .input('desc', 'Freshly roasted whole-bean arabica espresso. Choose Single, Double, Flat White, or Latte on the touchscreen.')
        .input('inst', '1. Place cup. 2. Tap drink choice. 3. Steam wand auto-purges after use.')
        .input('x', 32.5)
        .input('y', 54.0)
        .input('icon', 'Coffee')
        .query(`
            INSERT OR REPLACE INTO facility_hotspots (id, facility_id, title, item_name, description, instructions, pos_x, pos_y, icon)
            VALUES (@id, @facId, @title, @item, @desc, @inst, @x, @y, @icon)
        `);

    await pool.request()
        .input('id', 'hs-lei-k2')
        .input('facId', facLeiGfKitchen)
        .input('title', 'Zip HydroTap All-in-One')
        .input('item', 'Boiling, Chilled & Sparkling Water')
        .input('desc', 'Instant filtered 98°C boiling water for teas, chilled filtered drinking water, and effervescent sparkling water.')
        .input('inst', 'For boiling: safety lock requires two-finger press. Sparkling: select diamond icon.')
        .input('x', 68.0)
        .input('y', 48.0)
        .input('icon', 'Droplets')
        .query(`
            INSERT OR REPLACE INTO facility_hotspots (id, facility_id, title, item_name, description, instructions, pos_x, pos_y, icon)
            VALUES (@id, @facId, @title, @item, @desc, @inst, @x, @y, @icon)
        `);

    // 2. London Ground Floor Design Lounge
    const facLonGfLounge = 'fac-lon-gf-lounge';
    await pool.request()
        .input('id', facLonGfLounge)
        .input('floorId', londonGfId)
        .input('name', 'Clerkenwell Barista Bar & Client Lounge')
        .input('type', 'kitchen')
        .input('photoUrl', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80')
        .input('desc', 'Artisan coffee bar with complimentary pastries, kombucha on tap, and breakout booths.')
        .query(`
            INSERT OR REPLACE INTO facility_areas (id, floor_id, name, type, photo_url, description)
            VALUES (@id, @floorId, @name, @type, @photoUrl, @desc)
        `);

    await pool.request()
        .input('id', 'hs-lon-k1')
        .input('facId', facLonGfLounge)
        .input('title', 'La Marzocco Commercial Espresso Bar')
        .input('item', 'Barista Espresso')
        .input('desc', 'Twin boiler commercial espresso machine paired with Mahlkönig precision grinder.')
        .input('inst', 'Grind dial is pre-calibrated. Please clean portafilter after each shot.')
        .input('x', 45.0)
        .input('y', 60.0)
        .input('icon', 'Coffee')
        .query(`
            INSERT OR REPLACE INTO facility_hotspots (id, facility_id, title, item_name, description, instructions, pos_x, pos_y, icon)
            VALUES (@id, @facId, @title, @item, @desc, @inst, @x, @y, @icon)
        `);

    console.log('[MIGRATION] Facility areas and interactive photo hotspots created & seeded successfully.');
};

if (require.main === module) {
    migrateHotspotsAndWizard().then(() => process.exit(0));
}