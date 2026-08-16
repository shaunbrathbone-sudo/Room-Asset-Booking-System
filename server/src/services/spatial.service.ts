import { getPool } from '../config/database';
import { Country, Office, Floor, Zone, Desk, MeetingRoom, Amenity, Tenant } from '../types/spatial';

export const getCountries = async (): Promise<Country[]> => {
    const pool = await getPool();

    const result = await pool.request().query(`
        SELECT
            c.id, c.name, c.iso_code, c.slug, c.latitude, c.longitude,
            COUNT(DISTINCT o.id) AS office_count,
            COALESCE(SUM(desk_counts.total), 0) AS total_desks,
            COALESCE(SUM(desk_counts.available), 0) AS available_desks
        FROM countries c
        LEFT JOIN offices o ON o.country_id = c.id AND o.is_active = 1
        LEFT JOIN (
            SELECT
                f.office_id,
                COUNT(d.id) AS total,
                SUM(CASE WHEN d.status = 'available' AND d.is_bookable = 1 THEN 1 ELSE 0 END) AS available
            FROM floors f
            JOIN zones z ON z.floor_id = f.id
            JOIN desks d ON d.zone_id = z.id
            GROUP BY f.office_id
        ) desk_counts ON desk_counts.office_id = o.id
        GROUP BY c.id, c.name, c.iso_code, c.slug, c.latitude, c.longitude
        ORDER BY c.name
    `);

    return result.recordset.map((row: any) => ({
        id: row.id,
        name: row.name,
        isoCode: row.iso_code,
        slug: row.slug,
        latitude: row.latitude,
        longitude: row.longitude,
        officeCount: row.office_count,
        totalDesks: row.total_desks,
        availableDesks: row.available_desks,
    }));
};

export const getOfficesByCountry = async (countrySlug: string): Promise<Office[]> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('slug', countrySlug)
        .query(`
            SELECT o.*, c.slug AS country_slug
            FROM offices o
            JOIN countries c ON c.id = o.country_id
            WHERE c.slug = @slug AND o.is_active = 1
            ORDER BY o.name
        `);

    const offices: Office[] = [];

    for (const row of result.recordset) {
        const tenantResult = await pool.request()
            .input('officeId', row.id)
            .query(`
                SELECT t.id, t.name, t.code, t.logo_url, t.is_active
                FROM tenants t
                JOIN office_tenants ot ON ot.tenant_id = t.id
                WHERE ot.office_id = @officeId
            `);

        offices.push({
            id: row.id,
            countryId: row.country_id,
            name: row.name,
            slug: row.slug,
            addressLine1: row.address_line1,
            addressLine2: row.address_line2,
            city: row.city,
            postcode: row.postcode,
            latitude: row.latitude,
            longitude: row.longitude,
            photoUrl: row.photo_url,
            floorCount: row.floor_count,
            operationalHours: row.operational_hours,
            isActive: row.is_active,
            tenants: tenantResult.recordset.map((t: any) => ({
                id: t.id,
                name: t.name,
                code: t.code,
                logoUrl: t.logo_url,
                isActive: t.is_active,
            })),
        });
    }

    return offices;
};

export const getOfficeBySlug = async (slug: string): Promise<Office | null> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('slug', slug)
        .query('SELECT * FROM offices WHERE slug = @slug AND is_active = 1');

    if (result.recordset.length === 0) return null;

    const row = result.recordset[0];

    const tenantResult = await pool.request()
        .input('officeId', row.id)
        .query(`
            SELECT t.id, t.name, t.code, t.logo_url, t.is_active
            FROM tenants t
            JOIN office_tenants ot ON ot.tenant_id = t.id
            WHERE ot.office_id = @officeId
        `);

    return {
        id: row.id,
        countryId: row.country_id,
        name: row.name,
        slug: row.slug,
        addressLine1: row.address_line1,
        addressLine2: row.address_line2,
        city: row.city,
        postcode: row.postcode,
        latitude: row.latitude,
        longitude: row.longitude,
        photoUrl: row.photo_url,
        floorCount: row.floor_count,
        operationalHours: row.operational_hours,
        isActive: row.is_active,
        tenants: tenantResult.recordset.map((t: any) => ({
            id: t.id,
            name: t.name,
            code: t.code,
            logoUrl: t.logo_url,
            isActive: t.is_active,
        })),
    };
};

export const getFloorsByOffice = async (officeSlug: string): Promise<Floor[]> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('slug', officeSlug)
        .query(`
            SELECT f.*, o.slug AS office_slug,
                COALESCE(dc.total, 0) AS total_desks,
                COALESCE(dc.available, 0) AS available_desks
            FROM floors f
            JOIN offices o ON o.id = f.office_id
            LEFT JOIN (
                SELECT z.floor_id,
                    COUNT(d.id) AS total,
                    SUM(CASE WHEN d.status = 'available' AND d.is_bookable = 1 THEN 1 ELSE 0 END) AS available
                FROM zones z
                JOIN desks d ON d.zone_id = z.id
                GROUP BY z.floor_id
            ) dc ON dc.floor_id = f.id
            WHERE o.slug = @slug
            ORDER BY f.floor_number
        `);

    return result.recordset.map((row: any) => ({
        id: row.id,
        officeId: row.office_id,
        floorNumber: row.floor_number,
        name: row.name,
        slug: row.slug,
        planImageUrl: row.plan_image_url,
        occupancyPercent: row.total_desks > 0
            ? Math.round(((row.total_desks - row.available_desks) / row.total_desks) * 100)
            : 0,
    }));
};

export const getFloorPlan = async (floorId: string): Promise<Floor | null> => {
    const pool = await getPool();

    const floorResult = await pool.request()
        .input('id', floorId)
        .query('SELECT * FROM floors WHERE id = @id');

    if (floorResult.recordset.length === 0) return null;

    const floorRow = floorResult.recordset[0];

    const zonesResult = await pool.request()
        .input('floorId', floorId)
        .query('SELECT * FROM zones WHERE floor_id = @floorId ORDER BY name');

    const zones: Zone[] = [];

    for (const zRow of zonesResult.recordset) {
        const desksResult = await pool.request()
            .input('zoneId', zRow.id)
            .query('SELECT * FROM desks WHERE zone_id = @zoneId ORDER BY code');

        const roomsResult = await pool.request()
            .input('zoneId', zRow.id)
            .query('SELECT * FROM meeting_rooms WHERE zone_id = @zoneId ORDER BY name');

        const amenitiesResult = await pool.request()
            .input('zoneId', zRow.id)
            .query('SELECT * FROM amenities WHERE zone_id = @zoneId ORDER BY name');

        const tenantResult = await pool.request()
            .input('zoneId', zRow.id)
            .query(`
                SELECT t.id, t.name, t.code, t.logo_url, t.is_active
                FROM tenants t
                JOIN zone_tenants zt ON zt.tenant_id = t.id
                WHERE zt.zone_id = @zoneId
            `);

        zones.push({
            id: zRow.id,
            floorId: zRow.floor_id,
            name: zRow.name,
            type: zRow.type,
            capacity: zRow.capacity,
            x: zRow.x,
            y: zRow.y,
            width: zRow.width,
            height: zRow.height,
            tenants: tenantResult.recordset.map((t: any) => ({
                id: t.id, name: t.name, code: t.code, logoUrl: t.logo_url, isActive: t.is_active,
            })),
            desks: desksResult.recordset.map((d: any) => ({
                id: d.id, zoneId: d.zone_id, code: d.code, label: d.label,
                x: d.x, y: d.y, status: d.status, isBookable: d.is_bookable,
                equipmentTags: d.equipment_tags,
            })),
            meetingRooms: roomsResult.recordset.map((r: any) => ({
                id: r.id, zoneId: r.zone_id, name: r.name, capacity: r.capacity,
                equipmentTags: r.equipment_tags, requiresApproval: r.requires_approval,
                status: r.status,
            })),
            amenities: amenitiesResult.recordset.map((a: any) => ({
                id: a.id, zoneId: a.zone_id, type: a.type, name: a.name, x: a.x, y: a.y,
            })),
        });
    }

    return {
        id: floorRow.id,
        officeId: floorRow.office_id,
        floorNumber: floorRow.floor_number,
        name: floorRow.name,
        slug: floorRow.slug,
        planImageUrl: floorRow.plan_image_url,
        zones,
    };
};