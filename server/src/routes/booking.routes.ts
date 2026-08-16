import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// ── 1. GET USER BOOKINGS ─────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.user!.id;

        const result = await pool.request()
            .input('userId', userId)
            .query(`
                SELECT 
                    b.id, b.resource_type, b.resource_id, b.start_time, b.end_time,
                    b.status, b.check_in_token, b.checked_in_at, b.created_at,
                    CASE 
                        WHEN b.resource_type = 'desk' THEN d.code
                        WHEN b.resource_type = 'meeting_room' THEN mr.name
                        WHEN b.resource_type = 'asset' THEN a.name
                        ELSE 'Resource'
                    END AS resource_name,
                    CASE 
                        WHEN b.resource_type = 'desk' THEN f.name
                        WHEN b.resource_type = 'meeting_room' THEN rf.name
                        ELSE NULL
                    END AS floor_name,
                    CASE 
                        WHEN b.resource_type = 'desk' THEN o.name
                        WHEN b.resource_type = 'meeting_room' THEN ro.name
                        ELSE NULL
                    END AS office_name
                FROM bookings b
                LEFT JOIN desks d ON d.id = b.resource_id AND b.resource_type = 'desk'
                LEFT JOIN zones z ON z.id = d.zone_id
                LEFT JOIN floors f ON f.id = z.floor_id
                LEFT JOIN offices o ON o.id = f.office_id
                LEFT JOIN meeting_rooms mr ON mr.id = b.resource_id AND b.resource_type = 'meeting_room'
                LEFT JOIN zones rz ON rz.id = mr.zone_id
                LEFT JOIN floors rf ON rf.id = rz.floor_id
                LEFT JOIN offices ro ON ro.id = rf.office_id
                LEFT JOIN assets a ON a.id = b.resource_id AND b.resource_type = 'asset'
                WHERE b.user_id = @userId
                ORDER BY b.start_time DESC
            `);

        res.json(result.recordset.map((row: any) => ({
            id: row.id,
            resourceType: row.resource_type,
            resourceId: row.resource_id,
            resourceName: row.resource_name,
            floorName: row.floor_name,
            officeName: row.office_name,
            startTime: row.start_time,
            endTime: row.end_time,
            status: row.status,
            checkInToken: row.check_in_token,
            checkedInAt: row.checked_in_at,
            createdAt: row.created_at,
        })));
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── 2. CREATE SINGLE BOOKING ─────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { resourceType, resourceId, startTime, endTime, notes } = req.body;
        const userId = req.user!.id;

        if (!resourceType || !resourceId || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing required reservation fields' });
        }

        const pool = await getPool();

        // Conflict check
        const conflict = await pool.request()
            .input('resourceId', resourceId)
            .input('startTime', startTime)
            .input('endTime', endTime)
            .query(`
                SELECT id FROM bookings
                WHERE resource_id = @resourceId
                  AND status IN ('confirmed', 'pending_approval')
                  AND datetime(start_time) < datetime(@endTime)
                  AND datetime(end_time) > datetime(@startTime)
            `);

        if (conflict.recordset.length > 0) {
            return res.status(409).json({ error: 'Workstation or asset is already booked for this time window.' });
        }

        // Check if resource requires approval
        let initialStatus = 'confirmed';
        if (resourceType === 'meeting_room') {
            const roomRes = await pool.request().input('id', resourceId).query('SELECT requires_approval FROM meeting_rooms WHERE id = @id');
            if (roomRes.recordset[0]?.requires_approval === 1) initialStatus = 'pending_approval';
        } else if (resourceType === 'asset') {
            const assetRes = await pool.request().input('id', resourceId).query('SELECT requires_approval FROM assets WHERE id = @id');
            if (assetRes.recordset[0]?.requires_approval === 1) initialStatus = 'pending_approval';
        }

        const bookingId = uuidv4();
        const checkInToken = uuidv4();

        await pool.request()
            .input('id', bookingId)
            .input('userId', userId)
            .input('resourceType', resourceType)
            .input('resourceId', resourceId)
            .input('startTime', startTime)
            .input('endTime', endTime)
            .input('status', initialStatus)
            .input('checkInToken', checkInToken)
            .input('notes', notes || null)
            .query(`
                INSERT INTO bookings (id, user_id, resource_type, resource_id, start_time, end_time, status, check_in_token, notes)
                VALUES (@id, @userId, @resourceType, @resourceId, @startTime, @endTime, @status, @checkInToken, @notes)
            `);

        res.status(201).json({
            message: initialStatus === 'pending_approval' ? 'Reservation submitted for manager approval.' : 'Reservation confirmed successfully.',
            bookingId,
            status: initialStatus,
            checkInToken,
        });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({ error: 'Internal server error creating booking' });
    }
});

// ── 3. CREATE RECURRING BOOKING SERIES ────────────────────────────
router.post('/recurring', async (req, res) => {
    try {
        const { resourceType, resourceId, startTimeHours, endTimeHours, repeatDays, weeksCount = 4, notes } = req.body;
        const userId = req.user!.id;

        // repeatDays is an array of weekday numbers [0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat]
        if (!resourceType || !resourceId || !startTimeHours || !endTimeHours || !Array.isArray(repeatDays) || repeatDays.length === 0) {
            return res.status(400).json({ error: 'Missing recurring scheduling parameters.' });
        }

        const pool = await getPool();
        const recurringGroupId = uuidv4();
        const createdBookings: any[] = [];
        const skippedConflicts: string[] = [];

        const today = new Date();

        for (let w = 0; w < weeksCount; w++) {
            for (const dayOfWeek of repeatDays) {
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + (w * 7) + ((dayOfWeek - today.getDay() + 7) % 7));

                const [startH, startM] = startTimeHours.split(':').map(Number);
                const [endH, endM] = endTimeHours.split(':').map(Number);

                const startDateTime = new Date(targetDate);
                startDateTime.setHours(startH, startM, 0, 0);

                const endDateTime = new Date(targetDate);
                endDateTime.setHours(endH, endM, 0, 0);

                const startIso = startDateTime.toISOString();
                const endIso = endDateTime.toISOString();

                // Conflict check for this specific recurring occurrence
                const conflict = await pool.request()
                    .input('resourceId', resourceId)
                    .input('startTime', startIso)
                    .input('endTime', endIso)
                    .query(`
                        SELECT id FROM bookings
                        WHERE resource_id = @resourceId
                          AND status IN ('confirmed', 'pending_approval')
                          AND datetime(start_time) < datetime(@endTime)
                          AND datetime(end_time) > datetime(@startTime)
                    `);

                if (conflict.recordset.length > 0) {
                    skippedConflicts.push(startDateTime.toLocaleDateString('en-GB'));
                    continue;
                }

                const bookingId = uuidv4();
                const checkInToken = uuidv4();

                await pool.request()
                    .input('id', bookingId)
                    .input('userId', userId)
                    .input('resourceType', resourceType)
                    .input('resourceId', resourceId)
                    .input('startTime', startIso)
                    .input('endTime', endIso)
                    .input('status', 'confirmed')
                    .input('checkInToken', checkInToken)
                    .input('notes', notes ? `${notes} (Recurring Series)` : 'Recurring Hybrid Reservation')
                    .query(`
                        INSERT INTO bookings (id, user_id, resource_type, resource_id, start_time, end_time, status, check_in_token, notes)
                        VALUES (@id, @userId, @resourceType, @resourceId, @startTime, @endTime, @status, @checkInToken, @notes)
                    `);

                createdBookings.push({
                    id: bookingId,
                    date: startDateTime.toLocaleDateString('en-GB'),
                    startTime: startIso,
                    endTime: endIso,
                });
            }
        }

        res.status(201).json({
            message: `Created ${createdBookings.length} recurring reservations across ${weeksCount} weeks.`,
            recurringGroupId,
            totalCreated: createdBookings.length,
            createdBookings,
            skippedConflicts,
        });
    } catch (err) {
        console.error('Error creating recurring bookings:', err);
        res.status(500).json({ error: 'Internal server error creating recurring reservations' });
    }
});

export default router;