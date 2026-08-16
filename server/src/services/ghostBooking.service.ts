import { getPool } from '../config/database';

/**
 * Auto-Release Ghost Bookings:
 * If ghost booking protection is enabled, checks for confirmed bookings whose start time
 * was more than `grace_mins` ago, but the user has not checked in (`checked_in = 0`).
 * Automatically releases the resource back to the pool and marks the booking as `no_show`.
 */
export const runGhostBookingCheck = async (): Promise<number> => {
    try {
        const pool = await getPool();

        // 1. Check if ghost booking auto-release is toggled ON
        const configRes = await pool.request()
            .input('key', 'ghost_booking_enabled')
            .query("SELECT config_value FROM system_configs WHERE config_key = @key");

        const isEnabled = configRes.recordset.length > 0 && configRes.recordset[0].config_value === 'true';
        if (!isEnabled) {
            return 0;
        }

        // 2. Read grace period
        const graceRes = await pool.request()
            .input('key', 'ghost_booking_grace_mins')
            .query("SELECT config_value FROM system_configs WHERE config_key = @key");
        const graceMins = graceRes.recordset.length > 0 ? parseInt(graceRes.recordset[0].config_value, 10) : 15;

        // 3. Find expired unchecked bookings
        const expired = await pool.request()
            .input('graceMins', graceMins)
            .query(`
                SELECT id, resource_type, resource_id
                FROM bookings
                WHERE status = 'confirmed'
                  AND checked_in = 0
                  AND DATEADD(minute, @graceMins, start_time) < GETUTCDATE()
                  AND end_time > GETUTCDATE()
            `);

        if (expired.recordset.length === 0) {
            return 0;
        }

        // 4. Update status to 'no_show'
        for (const b of expired.recordset) {
            await pool.request()
                .input('id', b.id)
                .query(`
                    UPDATE bookings
                    SET status = 'no_show', updated_at = GETUTCDATE()
                    WHERE id = @id
                `);
            console.log(`[GHOST-BOOKING] Auto-released unconfirmed ${b.resource_type} reservation ID: ${b.id}`);
        }

        return expired.recordset.length;
    } catch (err) {
        console.error('[GHOST-BOOKING] Error running check:', (err as Error).message);
        return 0;
    }
};

/**
 * Start recurring background scheduler for ghost bookings.
 */
export const initGhostBookingScheduler = (intervalMs: number = 60000): NodeJS.Timeout => {
    console.log('[GHOST-BOOKING] Scheduler initialized (running every 60s).');
    return setInterval(() => {
        runGhostBookingCheck();
    }, intervalMs);
};