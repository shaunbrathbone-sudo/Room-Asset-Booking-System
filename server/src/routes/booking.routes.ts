import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import * as bookingService from '../services/booking.service';

const router = Router();

const createBookingSchema = z.object({
    resourceType: z.enum(['desk', 'meeting_room', 'asset']),
    resourceId: z.string().uuid(),
    startTime: z.string().datetime({ offset: true }).or(z.string().min(10)),
    endTime: z.string().datetime({ offset: true }).or(z.string().min(10)),
    licenseImageUrl: z.string().optional(),
    startMileage: z.number().optional(),
    notes: z.string().max(1000).optional(),
});

const timelineQuerySchema = z.object({
    floorId: z.string().uuid(),
    startDate: z.string().min(10),
    endDate: z.string().min(10),
});

/**
 * POST /api/bookings — Create a new booking
 */
router.post('/', authenticate, validateBody(createBookingSchema), async (req: Request, res: Response) => {
    try {
        const booking = await bookingService.createBooking({
            userId: req.user!.id,
            ...req.body,
        });
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/bookings/my — Get authenticated user bookings
 */
router.get('/my', authenticate, async (req: Request, res: Response) => {
    try {
        const bookings = await bookingService.getUserBookings(req.user!.id);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/bookings/timeline — Get floor booking schedule
 */
router.get('/timeline', optionalAuth, validateQuery(timelineQuerySchema), async (req: Request, res: Response) => {
    try {
        const { floorId, startDate, endDate } = req.query as unknown as { floorId: string; startDate: string; endDate: string };
        const timeline = await bookingService.getFloorBookingsTimeline(floorId, startDate, endDate);
        res.json(timeline);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

/**
 * DELETE /api/bookings/:id — Cancel a booking (authenticated)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const isAdmin = req.user!.role === 'location_admin' || req.user!.role === 'super_admin';
        await bookingService.cancelBooking(id, req.user!.id, isAdmin);
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

/**
 * GET /api/bookings/cancel-by-token?token= — 1-Click tokenized cancellation
 */
router.get('/cancel-by-token', async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;
        if (!token) {
            res.status(400).json({ error: 'Cancellation token required' });
            return;
        }
        const result = await bookingService.cancelBookingByToken(token);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

/**
 * POST /api/bookings/checkin-by-token — QR/Web Check-in
 */
router.post('/checkin-by-token', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Check-in token required' });
            return;
        }
        const result = await bookingService.checkinBooking(token);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;