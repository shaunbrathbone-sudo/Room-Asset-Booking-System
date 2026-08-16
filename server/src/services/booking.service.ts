import { randomUUID } from 'crypto';
import { getPool } from '../config/database';
import { BookingDetails } from '../types/spatial';

export interface CreateBookingParams {
    userId: string;
    resourceType: 'desk' | 'meeting_room' | 'asset';
    resourceId: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    licenseImageUrl?: string;
    startMileage?: number;
    notes?: string;
}

/**
 * Check if a resource is available during a given time window.
 */
export const isResourceAvailable = async (
    resourceType: 'desk' | 'meeting_room' | 'asset',
    resourceId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
): Promise<boolean> => {
    const pool = await getPool();

    const query = `
        SELECT id FROM bookings
        WHERE resource_type = @resourceType
          AND resource_id = @resourceId
          AND status IN ('confirmed', 'pending_approval', 'checked_in')
          AND (@startTime < end_time AND @endTime > start_time)
          ${excludeBookingId ? 'AND id != @excludeBookingId' : ''}
    `;

    const request = pool.request()
        .input('resourceType', resourceType)
        .input('resourceId', resourceId)
        .input('startTime', startTime)
        .input('endTime', endTime);

    if (excludeBookingId) {
        request.input('excludeBookingId', excludeBookingId);
    }

    const result = await request.query(query);
    return result.recordset.length === 0;
};

/**
 * Create a new booking with automatic token generation and approval routing.
 */
export const createBooking = async (params: CreateBookingParams): Promise<BookingDetails> => {
    const pool = await getPool();

    // 1. Check availability
    const available = await isResourceAvailable(
        params.resourceType,
        params.resourceId,
        params.startTime,
        params.endTime
    );

    if (!available) {
        throw new Error('This resource is already booked for the selected time interval.');
    }

    // 2. Check if resource requires approval
    let requiresApproval = false;
    if (params.resourceType === 'meeting_room') {
        const roomRes = await pool.request()
            .input('id', params.resourceId)
            .query('SELECT requires_approval FROM meeting_rooms WHERE id = @id');
        if (roomRes.recordset.length > 0) {
            requiresApproval = !!roomRes.recordset[0].requires_approval;
        }
    } else if (params.resourceType === 'asset') {
        const assetRes = await pool.request()
            .input('id', params.resourceId)
            .query('SELECT requires_approval, requires_license FROM assets WHERE id = @id');
        if (assetRes.recordset.length > 0) {
            requiresApproval = !!assetRes.recordset[0].requires_approval;
            if (assetRes.recordset[0].requires_license && !params.licenseImageUrl) {
                throw new Error('Driving license upload is mandatory for booking this fleet vehicle.');
            }
        }
    }

    const id = randomUUID();
    const cancelToken = randomUUID();
    const checkinToken = randomUUID();
    const status = requiresApproval ? 'pending_approval' : 'confirmed';

    await pool.request()
        .input('id', id)
        .input('userId', params.userId)
        .input('resourceType', params.resourceType)
        .input('resourceId', params.resourceId)
        .input('startTime', params.startTime)
        .input('endTime', params.endTime)
        .input('status', status)
        .input('cancelToken', cancelToken)
        .input('checkinToken', checkinToken)
        .input('licenseImageUrl', params.licenseImageUrl || null)
        .input('startMileage', params.startMileage || null)
        .input('notes', params.notes || null)
        .query(`
            INSERT INTO bookings (
                id, user_id, resource_type, resource_id, start_time, end_time,
                status, cancel_token, checkin_token, license_image_url, start_mileage,
                condition_notes
            ) VALUES (
                @id, @userId, @resourceType, @resourceId, @startTime, @endTime,
                @status, @cancelToken, @checkinToken, @licenseImageUrl, @startMileage,
                @notes
            )
        `);

    return getBookingById(id);
};

/**
 * Retrieve booking details with enriched metadata.
 */
export const getBookingById = async (bookingId: string): Promise<BookingDetails> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('id', bookingId)
        .query(`
            SELECT
                b.*,
                u.first_name + ' ' + u.last_name AS user_full_name,
                u.email AS user_email
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            WHERE b.id = @id
        `);

    if (result.recordset.length === 0) {
        throw new Error('Booking not found');
    }

    const b = result.recordset[0];
    let resourceName = 'Resource';
    let resourceCode = '';
    let officeName = '';
    let floorName = '';

    if (b.resource_type === 'desk') {
        const deskRes = await pool.request().input('id', b.resource_id).query(`
            SELECT d.code, d.label, f.name AS floor_name, o.name AS office_name
            FROM desks d
            JOIN zones z ON z.id = d.zone_id
            JOIN floors f ON f.id = z.floor_id
            JOIN offices o ON o.id = f.office_id
            WHERE d.id = @id
        `);
        if (deskRes.recordset.length > 0) {
            resourceName = deskRes.recordset[0].label || deskRes.recordset[0].code;
            resourceCode = deskRes.recordset[0].code;
            floorName = deskRes.recordset[0].floor_name;
            officeName = deskRes.recordset[0].office_name;
        }
    } else if (b.resource_type === 'meeting_room') {
        const roomRes = await pool.request().input('id', b.resource_id).query(`
            SELECT mr.name, f.name AS floor_name, o.name AS office_name
            FROM meeting_rooms mr
            JOIN zones z ON z.id = mr.zone_id
            JOIN floors f ON f.id = z.floor_id
            JOIN offices o ON o.id = f.office_id
            WHERE mr.id = @id
        `);
        if (roomRes.recordset.length > 0) {
            resourceName = roomRes.recordset[0].name;
            floorName = roomRes.recordset[0].floor_name;
            officeName = roomRes.recordset[0].office_name;
        }
    } else if (b.resource_type === 'asset') {
        const assetRes = await pool.request().input('id', b.resource_id).query(`
            SELECT a.name, a.identifier_code, o.name AS office_name
            FROM assets a
            JOIN offices o ON o.id = a.office_id
            WHERE a.id = @id
        `);
        if (assetRes.recordset.length > 0) {
            resourceName = assetRes.recordset[0].name;
            resourceCode = assetRes.recordset[0].identifier_code;
            officeName = assetRes.recordset[0].office_name;
        }
    }

    return {
        id: b.id,
        userId: b.user_id,
        resourceType: b.resource_type,
        resourceId: b.resource_id,
        resourceName,
        resourceCode,
        officeName,
        floorName,
        startTime: b.start_time.toISOString ? b.start_time.toISOString() : b.start_time,
        endTime: b.end_time.toISOString ? b.end_time.toISOString() : b.end_time,
        status: b.status,
        checkedIn: !!b.checked_in,
        checkinToken: b.checkin_token,
        cancelToken: b.cancel_token,
        approvalNote: b.approval_note,
        createdAt: b.created_at.toISOString ? b.created_at.toISOString() : b.created_at,
        userFullName: b.user_full_name,
        userEmail: b.user_email,
    };
};

/**
 * Get all bookings for a user.
 */
export const getUserBookings = async (userId: string): Promise<BookingDetails[]> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('userId', userId)
        .query(`
            SELECT id FROM bookings
            WHERE user_id = @userId
            ORDER BY start_time DESC
        `);

    const list: BookingDetails[] = [];
    for (const row of result.recordset) {
        list.push(await getBookingById(row.id));
    }
    return list;
};

/**
 * Cancel a booking by ID (requires authenticated user owner or admin).
 */
export const cancelBooking = async (bookingId: string, userId: string, isAdmin: boolean = false): Promise<void> => {
    const pool = await getPool();

    const check = await pool.request()
        .input('id', bookingId)
        .query('SELECT user_id, status FROM bookings WHERE id = @id');

    if (check.recordset.length === 0) {
        throw new Error('Booking not found');
    }

    if (!isAdmin && check.recordset[0].user_id !== userId) {
        throw new Error('You do not have permission to cancel this booking.');
    }

    await pool.request()
        .input('id', bookingId)
        .query("UPDATE bookings SET status = 'cancelled', updated_at = GETUTCDATE() WHERE id = @id");
};

/**
 * 1-Click Cancellation via cryptographically signed/opaque token (from reminder emails).
 */
export const cancelBookingByToken = async (cancelToken: string): Promise<{ success: boolean; message: string }> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('cancelToken', cancelToken)
        .query("SELECT id, status FROM bookings WHERE cancel_token = @cancelToken");

    if (result.recordset.length === 0) {
        throw new Error('Invalid or expired cancellation link.');
    }

    const booking = result.recordset[0];
    if (booking.status === 'cancelled') {
        return { success: true, message: 'This booking has already been cancelled.' };
    }

    await pool.request()
        .input('id', booking.id)
        .query("UPDATE bookings SET status = 'cancelled', updated_at = GETUTCDATE() WHERE id = @id");

    return { success: true, message: 'Your booking has been successfully cancelled.' };
};

/**
 * Perform QR / web check-in.
 */
export const checkinBooking = async (checkinToken: string): Promise<{ success: boolean; message: string }> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('checkinToken', checkinToken)
        .query("SELECT id, status, checked_in FROM bookings WHERE checkin_token = @checkinToken");

    if (result.recordset.length === 0) {
        throw new Error('Invalid check-in code or QR token.');
    }

    const booking = result.recordset[0];
    if (booking.checked_in) {
        return { success: true, message: 'You have already checked in for this booking.' };
    }

    if (booking.status === 'cancelled') {
        throw new Error('Cannot check in to a cancelled reservation.');
    }

    await pool.request()
        .input('id', booking.id)
        .query(`
            UPDATE bookings
            SET checked_in = 1, status = 'checked_in', checkin_time = GETUTCDATE(), updated_at = GETUTCDATE()
            WHERE id = @id
        `);

    return { success: true, message: 'Check-in successful! Welcome to your workspace.' };
};

/**
 * Get active timeline bookings for a floor (to compute live 7/14 day availability).
 */
export const getFloorBookingsTimeline = async (floorId: string, startDate: string, endDate: string): Promise<any[]> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('floorId', floorId)
        .input('startDate', startDate)
        .input('endDate', endDate)
        .query(`
            SELECT
                b.id, b.resource_type, b.resource_id, b.start_time, b.end_time, b.status,
                u.first_name + ' ' + u.last_name AS user_name
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            WHERE b.status IN ('confirmed', 'checked_in', 'pending_approval')
              AND b.start_time < @endDate AND b.end_time > @startDate
              AND (
                  b.resource_id IN (
                      SELECT d.id FROM desks d
                      JOIN zones z ON z.id = d.zone_id
                      WHERE z.floor_id = @floorId
                  )
                  OR b.resource_id IN (
                      SELECT mr.id FROM meeting_rooms mr
                      JOIN zones z ON z.id = mr.zone_id
                      WHERE z.floor_id = @floorId
                  )
              )
        `);

    return result.recordset;
};