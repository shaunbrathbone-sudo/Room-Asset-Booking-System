/** Status colour mappings for desk/room nodes */
export const STATUS_COLOURS = {
    available: '#22c55e',      // Green
    occupied: '#ef4444',       // Red
    out_of_service: '#9ca3af', // Grey
    permanent: '#6b7280',      // Dark grey
    partial: '#f59e0b',        // Amber
} as const;

/** Spatial navigation levels */
export const SPATIAL_LEVELS = ['globe', 'country', 'office', 'floor', 'resource'] as const;

/** Default camera positions for each spatial level */
export const CAMERA_POSITIONS = {
    globe: { x: 0, y: 0, z: 250 },
    country: { x: 0, y: 50, z: 100 },
    office: { x: 0, y: 30, z: 50 },
    floor: { x: 0, y: 80, z: 20 },
} as const;

/** Amenity icon mappings */
export const AMENITY_ICONS: Record<string, string> = {
    kitchen: 'UtensilsCrossed',
    toilet: 'Bath',
    fire_exit: 'DoorOpen',
    printer: 'Printer',
    shower: 'ShowerHead',
    bike_storage: 'Bike',
    ev_charging: 'Zap',
    parking: 'Car',
    coffee_point: 'Coffee',
} as const;