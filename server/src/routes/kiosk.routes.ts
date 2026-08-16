import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getPool } from '../config/database';
import { createBooking, isResourceAvailable } from '../services/booking.service';

const router = Router();

/**
 * GET /api/kiosk/rooms/:id — Real-time room status for wall-mounted 7-10" PoE panels
 */
router.get('/rooms/:id', async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const pool = await getPool();

        const roomRes = await pool.request()
            .input('id', id)
            .query(`
                SELECT
                    mr.id, mr.name, mr.capacity, mr.equipment_tags, mr.requires_approval, mr.status,
                    f.name AS floor_name, o.name AS office_name
                FROM meeting_rooms mr
                JOIN zones z ON z.id = mr.zone_id
                JOIN floors f ON f.id = z.floor_id
                JOIN offices o ON o.id = f.office_id
                WHERE mr.id = @id
            `);

        if (roomRes.recordset.length === 0) {
            res.status(404).json({ error: 'Meeting room not found' });
            return;
        }

        const room = roomRes.recordset[0];

        // Fetch current active meeting
        const currentBookingRes = await pool.request()
            .input('roomId', id)
            .query(`
                SELECT TOP (1)
                    b.id, b.start_time, b.end_time, b.status,
                    u.first_name + ' ' + u.last_name AS organizer_name
                FROM bookings b
                JOIN users u ON u.id = b.user_id
                WHERE b.resource_type = 'meeting_room'
                  AND b.resource_id = @roomId
                  AND b.status IN ('confirmed', 'checked_in')
                  AND GETUTCDATE() BETWEEN b.start_time AND b.end_time
            `);

        // Fetch upcoming meetings today
        const upcomingRes = await pool.request()
            .input('roomId', id)
            .query(`
                SELECT
                    b.id, b.start_time, b.end_time, b.status,
                    u.first_name + ' ' + u.last_name AS organizer_name
                FROM bookings b
                JOIN users u ON u.id = b.user_id
                WHERE b.resource_type = 'meeting_room'
                  AND b.resource_id = @roomId
                  AND b.status IN ('confirmed', 'checked_in')
                  AND b.start_time > GETUTCDATE()
                ORDER BY b.start_time ASC
            `);

        const isOccupied = currentBookingRes.recordset.length > 0;

        res.json({
            room: {
                id: room.id,
                name: room.name,
                capacity: room.capacity,
                equipmentTags: room.equipment_tags,
                floorName: room.floor_name,
                officeName: room.office_name,
            },
            isOccupied,
            currentMeeting: isOccupied ? {
                id: currentBookingRes.recordset[0].id,
                organizerName: currentBookingRes.recordset[0].organizer_name,
                startTime: currentBookingRes.recordset[0].start_time,
                endTime: currentBookingRes.recordset[0].end_time,
            } : null,
            upcomingMeetings: upcomingRes.recordset.map((row: any) => ({
                id: row.id,
                organizerName: row.organizer_name,
                startTime: row.start_time,
                endTime: row.end_time,
            })),
        });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * POST /api/kiosk/rooms/:id/adhoc-book — 1-Click ad-hoc booking from tablet screen (15m / 30m / 60m)
 */
router.post('/rooms/:id/adhoc-book', async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const durationMins = req.body.durationMins || 15;
        const pool = await getPool();

        // Find or create default kiosk user
        let kioskUserRes = await pool.request().query("SELECT id FROM users WHERE email = 'kiosk@office.internal'");
        let kioskUserId: string;

        if (kioskUserRes.recordset.length === 0) {
            const newId = '00000000-0000-0000-0000-000000000001';
            await pool.request()
                .input('id', newId)
                .query(`
                    INSERT INTO users (id, email, password_hash, first_name, last_name, role)
                    VALUES (@id, 'kiosk@office.internal', 'kiosk-dummy', 'Ad-hoc Panel', 'Booking', 'employee')
                `);
            kioskUserId = newId;
        } else {
            kioskUserId = kioskUserRes.recordset[0].id;
        }

        const now = new Date();
        const end = new Date(now.getTime() + durationMins * 60000);

        const booking = await createBooking({
            userId: kioskUserId,
            resourceType: 'meeting_room',
            resourceId: id,
            startTime: now.toISOString(),
            endTime: end.toISOString(),
            notes: 'Instant ad-hoc kiosk booking from wall panel',
        });

        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;