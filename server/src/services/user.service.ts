import { getPool } from '../config/database';

export interface UserPreferences {
    userId: string;
    homeOfficeId: string | null;
    homeFloorId: string | null;
    preferredZoneId: string | null;
    defaultView: 'globe' | 'office' | 'floor';
    homeOfficeSlug?: string;
    homeFloorSlug?: string;
    homeCountrySlug?: string;
}

/**
 * Get user preferences including navigation slugs for smart landing.
 */
export const getPreferences = async (userId: string): Promise<UserPreferences | null> => {
    const pool = await getPool();

    const result = await pool.request()
        .input('userId', userId)
        .query(`
            SELECT
                up.user_id, up.home_office_id, up.home_floor_id,
                up.preferred_zone_id, up.default_view,
                o.slug AS office_slug,
                f.slug AS floor_slug,
                c.slug AS country_slug
            FROM user_preferences up
            LEFT JOIN offices o ON o.id = up.home_office_id
            LEFT JOIN floors f ON f.id = up.home_floor_id
            LEFT JOIN countries c ON c.id = o.country_id
            WHERE up.user_id = @userId
        `);

    if (result.recordset.length === 0) return null;

    const row = result.recordset[0];
    return {
        userId: row.user_id,
        homeOfficeId: row.home_office_id,
        homeFloorId: row.home_floor_id,
        preferredZoneId: row.preferred_zone_id,
        defaultView: row.default_view,
        homeOfficeSlug: row.office_slug,
        homeFloorSlug: row.floor_slug,
        homeCountrySlug: row.country_slug,
    };
};

/**
 * Update user preferences.
 */
export const updatePreferences = async (
    userId: string,
    prefs: Partial<Pick<UserPreferences, 'homeOfficeId' | 'homeFloorId' | 'preferredZoneId' | 'defaultView'>>
): Promise<void> => {
    const pool = await getPool();

    const sets: string[] = [];
    const request = pool.request().input('userId', userId);

    if (prefs.homeOfficeId !== undefined) {
        sets.push('home_office_id = @homeOfficeId');
        request.input('homeOfficeId', prefs.homeOfficeId);
    }
    if (prefs.homeFloorId !== undefined) {
        sets.push('home_floor_id = @homeFloorId');
        request.input('homeFloorId', prefs.homeFloorId);
    }
    if (prefs.preferredZoneId !== undefined) {
        sets.push('preferred_zone_id = @preferredZoneId');
        request.input('preferredZoneId', prefs.preferredZoneId);
    }
    if (prefs.defaultView !== undefined) {
        sets.push('default_view = @defaultView');
        request.input('defaultView', prefs.defaultView);
    }

    if (sets.length === 0) return;

    sets.push('updated_at = GETUTCDATE()');

    await request.query(`UPDATE user_preferences SET ${sets.join(', ')} WHERE user_id = @userId`);
};