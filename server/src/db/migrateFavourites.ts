import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';

export async function migrateFavourites() {
    console.log('[MIGRATION] Creating favourite_desks table...');
    const pool = await getPool();

    await pool.request().query(`
        CREATE TABLE IF NOT EXISTS favourite_desks (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            desk_id TEXT NOT NULL REFERENCES desks(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (user_id, desk_id)
        );
    `);

    // Seed default favourite desks for demo user (shaunrathbone@msn.com)
    const userRes = await pool.request().query(`SELECT id FROM users WHERE email = 'shaunrathbone@msn.com' LIMIT 1`);
    if (userRes.recordset?.length) {
        const userId = userRes.recordset[0].id;
        
        // Find 2 popular desks to add to favourites (e.g. Leicester LEI-D04 and London LON-D01 or Noida IND-D01)
        const desksRes = await pool.request().query(`
            SELECT id FROM desks 
            WHERE code IN ('LEI-D04', 'LON-D01', 'IND-D01', 'desk-01', 'desk-04')
            LIMIT 3
        `);

        for (const desk of desksRes.recordset) {
            await pool.request().query(`
                INSERT INTO favourite_desks (id, user_id, desk_id)
                VALUES ('${uuidv4()}', '${userId}', '${desk.id}')
                ON CONFLICT(user_id, desk_id) DO NOTHING;
            `);
        }
        console.log(`[SEED] Seeded initial favourite desks for user ${userId}`);
    }

    console.log('[SUCCESS] favourite_desks table created and seeded successfully!');
}

migrateFavourites().then(() => process.exit(0)).catch((err) => {
    console.error('[ERROR] Failed to migrate favourite_desks:', err);
    process.exit(1);
});