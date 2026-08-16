export interface Booking {
    id: string;
    userId: string;
    resourceType: 'desk' | 'meeting_room' | 'asset';
    resourceId: string;
    startTime: string;
    endTime: string;
    status: 'confirmed' | 'pending_approval' | 'cancelled' | 'checked_in' | 'no_show';
    checkedIn: boolean;
    approvalNote: string | null;
    createdAt: string;
}

export interface TimeSlot {
    start: string;
    end: string;
    isAvailable: boolean;
    bookingId?: string;
}