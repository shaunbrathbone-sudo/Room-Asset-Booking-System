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

export interface Asset {
    id: string;
    officeId: string;
    category: 'vehicle' | 'av_equipment' | 'loaner_hardware';
    name: string;
    model: string | null;
    identifierCode: string;
    photoUrl: string | null;
    description: string | null;
    requiresApproval: boolean;
    requiresLicense: boolean;
    currentMileage: number | null;
    fuelOrBattery: string | null;
    specifications: string | null;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
    isActive: boolean;
}

export interface AssetBookingInput {
    assetId: string;
    startTime: string;
    endTime: string;
    licenseImageUrl?: string;
    startMileage?: number;
    notes?: string;
}

export interface BookingDetails {
    id: string;
    userId: string;
    resourceType: 'desk' | 'meeting_room' | 'asset';
    resourceId: string;
    resourceName: string;
    resourceCode?: string;
    officeName?: string;
    floorName?: string;
    startTime: string;
    endTime: string;
    status: 'confirmed' | 'pending_approval' | 'cancelled' | 'checked_in' | 'no_show';
    checkedIn: boolean;
    checkinToken?: string;
    cancelToken?: string;
    approvalNote?: string | null;
    createdAt: string;
    userFullName?: string;
    userEmail?: string;
}