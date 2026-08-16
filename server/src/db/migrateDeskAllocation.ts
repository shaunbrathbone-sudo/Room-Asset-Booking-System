import { getPool } from '../config/database';

export async function migrateDeskAllocation() {
    console.log('[MIGRATION] Adding desk_type, assigned_user_id, assigned_user_name, assigned_days to desks table...');
    const pool = await getPool();

    try {
        await pool.request().query(`ALTER TABLE desks ADD COLUMN desk_type TEXT NOT NULL DEFAULT 'flexible'`);
    } catch (e: any) {
        console.log('[INFO] desk_type column might already exist:', e.message);
    }

    try {
        await pool.request().query(`ALTER TABLE desks ADD COLUMN assigned_user_id TEXT`);
    } catch (e: any) {
        console.log('[INFO] assigned_user_id column might already exist:', e.message);
    }

    try {
        await pool.request().query(`ALTER TABLE desks ADD COLUMN assigned_user_name TEXT`);
    } catch (e: any) {
        console.log('[INFO] assigned_user_name column might already exist:', e.message);
    }

    try {
        await pool.request().query(`ALTER TABLE desks ADD COLUMN assigned_days TEXT DEFAULT '["Mon","Tue","Wed","Thu","Fri"]'`);
    } catch (e: any) {
        console.log('[INFO] assigned_days column might already exist:', e.message);
    }

    // Seed some permanent desk allocations for Leicester Senior Leadership Team
    const userRes = await pool.request().query(`SELECT id, first_name, last_name FROM users WHERE email = 'shaunrathbone@msn.com' LIMIT 1`);
    if (userRes.recordset?.length) {
        const user = userRes.recordset[0];
        const userName = `${user.first_name || 'Shaun'} ${user.last_name || 'Rathbone'}`.trim();
        
        await pool.request().query(`
            UPDATE desks 
            SET desk_type = 'permanent',
                assigned_user_id = '${user.id}',
                assigned_user_name = '${userName}',
                assigned_days = '["Mon","Tue","Wed","Thu"]'
            WHERE code IN ('LEI-D01', 'desk-01')
        `);
        console.log(`[SEED] Assigned permanent desk LEI-D01 to ${userName}`);
    }

    console.log('[SUCCESS] Desk allocation schema updated and seeded successfully!');
}

migrateDeskAllocation().then(() => process.exit(0)).catch((err) => {
    console.error('[ERROR] Failed to migrate desk allocation:', err);
    process.exit(1);
});