export interface Tenant {
    id: string;
    name: string;
    code: string;
    logoUrl: string | null;
    isActive: boolean;
}

export interface Country {
    id: string;
    name: string;
    isoCode: string;
    slug: string;
    latitude: number;
    longitude: number;
    officeCount?: number;
    totalDesks?: number;
    availableDesks?: number;
}

export interface Office {
    id: string;
    countryId: string;
    name: string;
    slug: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    postcode: string;
    latitude: number;
    longitude: number;
    photoUrl: string | null;
    floorCount: number;
    operationalHours: string | null;
    isActive: boolean;
    tenants?: Tenant[];
}

export interface Floor {
    id: string;
    officeId: string;
    floorNumber: number;
    name: string;
    slug: string;
    planImageUrl: string | null;
    zones?: Zone[];
    occupancyPercent?: number;
}

export interface Zone {
    id: string;
    floorId: string;
    name: string;
    type: 'workspace' | 'meeting_room' | 'amenity' | 'hot_desk';
    capacity: number | null;
    x: number;
    y: number;
    width: number;
    height: number;
    tenants?: Tenant[];
    desks?: Desk[];
    meetingRooms?: MeetingRoom[];
    amenities?: Amenity[];
}

export interface Desk {
    id: string;
    zoneId: string;
    code: string;
    label: string | null;
    x: number;
    y: number;
    status: 'available' | 'occupied' | 'out_of_service' | 'permanent';
    isBookable: boolean;
    equipmentTags: string | null;
}

export interface MeetingRoom {
    id: string;
    zoneId: string;
    name: string;
    capacity: number;
    equipmentTags: string | null;
    requiresApproval: boolean;
    status: 'available' | 'occupied' | 'out_of_service';
}

export interface Amenity {
    id: string;
    zoneId: string;
    type: string;
    name: string;
    x: number;
    y: number;
}

export interface SearchResult {
    type: 'desk' | 'meeting_room' | 'office' | 'user';
    id: string;
    title: string;
    subtitle: string;
    meta: Record<string, string | number>;
    navigation: {
        countrySlug: string;
        officeSlug: string;
        floorSlug?: string;
        resourceId?: string;
    };
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