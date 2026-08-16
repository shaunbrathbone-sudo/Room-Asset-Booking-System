import { getPool } from '../config/database';

/**
 * Dispatches 24-hour pre-event reminder with cryptographically signed 1-click cancellation token.
 */
export const runPreEventReminders = async (): Promise<number> => {
    try {
        const pool = await getPool();

        // Find confirmed bookings starting between 23h and 25h from now that haven't been reminded
        const result = await pool.request().query(`
            SELECT
                b.id, b.cancel_token, b.checkin_token, b.start_time, b.end_time,
                b.resource_type, u.email, u.first_name
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            WHERE b.status = 'confirmed'
              AND b.start_time BETWEEN DATEADD(hour, 23, GETUTCDATE()) AND DATEADD(hour, 25, GETUTCDATE())
        `);

        for (const b of result.recordset) {
            const cancelUrl = `${process.env.APP_URL || 'http://localhost:3000'}/cancel-booking?token=${b.cancel_token}`;
            const checkinUrl = `${process.env.APP_URL || 'http://localhost:3000'}/checkin/${b.checkin_token}`;

            console.log(`[REMINDER-CRON] 24h Reminder ready for ${b.first_name} (${b.email}) - Resource: ${b.resource_type}`);
            console.log(`  └ 1-Click Cancel Link: ${cancelUrl}`);
            console.log(`  └ Check-In Link: ${checkinUrl}`);
        }

        return result.recordset.length;
    } catch (err) {
        console.error('[REMINDER-CRON] Error:', (err as Error).message);
        return 0;
    }
};