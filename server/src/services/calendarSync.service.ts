/**
 * Microsoft 365 Exchange Room Mailbox & Microsoft Bookings API Integration Adapter
 */
export interface ExternalCalendarEvent {
    id: string;
    subject: string;
    start: string;
    end: string;
    organizerEmail: string;
    location: string;
}

export const syncMeetingRoomToExchange = async (
    bookingId: string,
    roomEmail: string,
    startTime: string,
    endTime: string,
    subject: string
): Promise<string> => {
    // In production, interfaces with Microsoft Graph API: POST /users/{roomEmail}/events
    console.log(`[GRAPH-SYNC] Syncing reservation ${bookingId} to Microsoft 365 Exchange Room Mailbox <${roomEmail}>`);
    return `graph-event-${bookingId}`;
};

export const syncAssetToMicrosoftBookings = async (
    bookingId: string,
    bookingBusinessId: string,
    startTime: string,
    endTime: string,
    staffEmail: string
): Promise<string> => {
    // In production, interfaces with /solutions/bookingBusinesses/{id}/appointments
    console.log(`[BOOKINGS-API] Syncing shared asset ${bookingId} to Microsoft Bookings Business ${bookingBusinessId}`);
    return `booking-appt-${bookingId}`;
};