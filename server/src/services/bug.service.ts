import { randomUUID } from 'crypto';
import { getPool } from '../config/database';

export interface CreateBugParams {
    userId: string;
    officeId?: string;
    title: string;
    description: string;
    routePath?: string;
    objectId?: string;
    threeCoords?: string;
    browserInfo?: string;
    osInfo?: string;
    viewportSize?: string;
    consoleLogs?: string;
}

export interface BugItem {
    id: string;
    userId: string;
    reporterName: string;
    officeName?: string;
    title: string;
    description: string;
    routePath: string | null;
    objectId: string | null;
    multiplierCount: number;
    status: string;
    resolutionNotes: string | null;
    createdAt: string;
}

/**
 * Scan active unresolved tickets for live NLP / keyword deduplication.
 */
export const findDuplicateBugs = async (title: string, officeId?: string): Promise<BugItem[]> => {
    const pool = await getPool();

    // Extract significant keywords
    const words = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3);

    if (words.length === 0) return [];

    const likes = words.map((_, i) => `b.title LIKE @w${i}`).join(' OR ');

    const request = pool.request();
    words.forEach((w, i) => request.input(`w${i}`, `%${w}%`));

    let query = `
        SELECT TOP (5)
            b.*,
            u.first_name + ' ' + u.last_name AS reporter_name,
            o.name AS office_name
        FROM bug_tickets b
        JOIN users u ON u.id = b.user_id
        LEFT JOIN offices o ON o.id = b.office_id
        WHERE b.status IN ('open', 'triaged', 'in_progress')
          AND (${likes})
    `;

    if (officeId) {
        query += ' AND (b.office_id = @officeId OR b.office_id IS NULL)';
        request.input('officeId', officeId);
    }

    query += ' ORDER BY b.multiplier_count DESC, b.created_at DESC';

    const result = await request.query(query);

    return result.recordset.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        reporterName: row.reporter_name,
        officeName: row.office_name,
        title: row.title,
        description: row.description,
        routePath: row.route_path,
        objectId: row.object_id,
        multiplierCount: row.multiplier_count,
        status: row.status,
        resolutionNotes: row.resolution_notes,
        createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
    }));
};

/**
 * Create a new telemetry-attached bug ticket.
 */
export const createBugTicket = async (params: CreateBugParams): Promise<string> => {
    const pool = await getPool();
    const id = randomUUID();

    await pool.request()
        .input('id', id)
        .input('userId', params.userId)
        .input('officeId', params.officeId || null)
        .input('title', params.title)
        .input('description', params.description)
        .input('routePath', params.routePath || null)
        .input('objectId', params.objectId || null)
        .input('threeCoords', params.threeCoords || null)
        .input('browserInfo', params.browserInfo || null)
        .input('osInfo', params.osInfo || null)
        .input('viewportSize', params.viewportSize || null)
        .input('consoleLogs', params.consoleLogs || null)
        .query(`
            INSERT INTO bug_tickets (
                id, user_id, office_id, title, description, route_path,
                object_id, three_coords, browser_info, os_info, viewport_size,
                console_logs, multiplier_count, status
            ) VALUES (
                @id, @userId, @officeId, @title, @description, @routePath,
                @objectId, @threeCoords, @browserInfo, @osInfo, @viewportSize,
                @consoleLogs, 1, 'open'
            )
        `);

    return id;
};

/**
 * Increment Incident Multiplier ("I Have This Issue Too").
 */
export const subscribeToBug = async (bugId: string, userId: string): Promise<{ multiplier: number }> => {
    const pool = await getPool();

    const check = await pool.request()
        .input('bugId', bugId)
        .input('userId', userId)
        .query('SELECT * FROM bug_subscribers WHERE bug_id = @bugId AND user_id = @userId');

    if (check.recordset.length === 0) {
        await pool.request()
            .input('bugId', bugId)
            .input('userId', userId)
            .query('INSERT INTO bug_subscribers (bug_id, user_id) VALUES (@bugId, @userId)');

        await pool.request()
            .input('bugId', bugId)
            .query('UPDATE bug_tickets SET multiplier_count = multiplier_count + 1 WHERE id = @bugId');
    }

    const updated = await pool.request()
        .input('bugId', bugId)
        .query('SELECT multiplier_count FROM bug_tickets WHERE id = @bugId');

    return { multiplier: updated.recordset[0].multiplier_count };
};

/**
 * Get all bug tickets for triage.
 */
export const getAllBugs = async (status?: string): Promise<BugItem[]> => {
    const pool = await getPool();

    let query = `
        SELECT
            b.*,
            u.first_name + ' ' + u.last_name AS reporter_name,
            o.name AS office_name
        FROM bug_tickets b
        JOIN users u ON u.id = b.user_id
        LEFT JOIN offices o ON o.id = b.office_id
    `;

    const request = pool.request();
    if (status) {
        query += ' WHERE b.status = @status';
        request.input('status', status);
    }

    query += ' ORDER BY b.multiplier_count DESC, b.created_at DESC';

    const result = await request.query(query);

    return result.recordset.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        reporterName: row.reporter_name,
        officeName: row.office_name,
        title: row.title,
        description: row.description,
        routePath: row.route_path,
        objectId: row.object_id,
        multiplierCount: row.multiplier_count,
        status: row.status,
        resolutionNotes: row.resolution_notes,
        createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
    }));
};