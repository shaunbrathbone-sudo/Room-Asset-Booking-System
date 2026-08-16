import { getPool } from '../config/database';
import { SearchResult } from '../types/spatial';

/**
 * Universal search across desks, meeting rooms, offices, and users.
 * Returns categorised results with navigation metadata for fly-to.
 */
export const universalSearch = async (query: string, limit: number = 20): Promise<SearchResult[]> => {
    const pool = await getPool();
    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    // Search desks by code or label
    const deskResults = await pool.request()
        .input('q', searchTerm)
        .input('limit', Math.ceil(limit / 4))
        .query(`
            SELECT TOP (@limit)
                d.id, d.code, d.label, d.status,
                z.name AS zone_name,
                f.name AS floor_name, f.slug AS floor_slug,
                o.name AS office_name, o.slug AS office_slug,
                c.name AS country_name, c.slug AS country_slug
            FROM desks d
            JOIN zones z ON z.id = d.zone_id
            JOIN floors f ON f.id = z.floor_id
            JOIN offices o ON o.id = f.office_id
            JOIN countries c ON c.id = o.country_id
            WHERE d.code LIKE @q OR d.label LIKE @q
            ORDER BY d.code
        `);

    for (const row of deskResults.recordset) {
        results.push({
            type: 'desk',
            id: row.id,
            title: row.code,
            subtitle: `${row.zone_name} — ${row.floor_name}, ${row.office_name}`,
            meta: { status: row.status },
            navigation: {
                countrySlug: row.country_slug,
                officeSlug: row.office_slug,
                floorSlug: row.floor_slug,
                resourceId: row.id,
            },
        });
    }

    // Search meeting rooms by name
    const roomResults = await pool.request()
        .input('q', searchTerm)
        .input('limit', Math.ceil(limit / 4))
        .query(`
            SELECT TOP (@limit)
                mr.id, mr.name, mr.capacity, mr.status,
                z.name AS zone_name,
                f.name AS floor_name, f.slug AS floor_slug,
                o.name AS office_name, o.slug AS office_slug,
                c.slug AS country_slug
            FROM meeting_rooms mr
            JOIN zones z ON z.id = mr.zone_id
            JOIN floors f ON f.id = z.floor_id
            JOIN offices o ON o.id = f.office_id
            JOIN countries c ON c.id = o.country_id
            WHERE mr.name LIKE @q
            ORDER BY mr.name
        `);

    for (const row of roomResults.recordset) {
        results.push({
            type: 'meeting_room',
            id: row.id,
            title: row.name,
            subtitle: `${row.floor_name}, ${row.office_name} — Capacity: ${row.capacity}`,
            meta: { capacity: row.capacity, status: row.status },
            navigation: {
                countrySlug: row.country_slug,
                officeSlug: row.office_slug,
                floorSlug: row.floor_slug,
                resourceId: row.id,
            },
        });
    }

    // Search offices by name or city
    const officeResults = await pool.request()
        .input('q', searchTerm)
        .input('limit', Math.ceil(limit / 4))
        .query(`
            SELECT TOP (@limit)
                o.id, o.name, o.city, o.slug AS office_slug,
                c.name AS country_name, c.slug AS country_slug
            FROM offices o
            JOIN countries c ON c.id = o.country_id
            WHERE (o.name LIKE @q OR o.city LIKE @q) AND o.is_active = 1
            ORDER BY o.name
        `);

    for (const row of officeResults.recordset) {
        results.push({
            type: 'office',
            id: row.id,
            title: row.name,
            subtitle: `${row.city}, ${row.country_name}`,
            meta: {},
            navigation: {
                countrySlug: row.country_slug,
                officeSlug: row.office_slug,
            },
        });
    }

    // Search users by name or email (Colleague Finder)
    const userResults = await pool.request()
        .input('q', searchTerm)
        .input('limit', Math.ceil(limit / 4))
        .query(`
            SELECT TOP (@limit)
                u.id, u.first_name, u.last_name, u.email,
                t.name AS tenant_name,
                o.slug AS office_slug,
                c.slug AS country_slug
            FROM users u
            LEFT JOIN tenants t ON t.id = u.tenant_id
            LEFT JOIN user_preferences up ON up.user_id = u.id
            LEFT JOIN offices o ON o.id = up.home_office_id
            LEFT JOIN countries c ON c.id = o.country_id
            WHERE (u.first_name LIKE @q OR u.last_name LIKE @q OR u.email LIKE @q)
                AND u.is_active = 1
            ORDER BY u.last_name, u.first_name
        `);

    for (const row of userResults.recordset) {
        results.push({
            type: 'user',
            id: row.id,
            title: `${row.first_name} ${row.last_name}`,
            subtitle: row.tenant_name || row.email,
            meta: { email: row.email },
            navigation: {
                countrySlug: row.country_slug || '',
                officeSlug: row.office_slug || '',
            },
        });
    }

    return results;
};